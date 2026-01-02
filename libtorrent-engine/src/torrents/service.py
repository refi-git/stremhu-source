import logging
import os
import time
from typing import Any, Dict, List

import libtorrent as libtorrent
from fastapi import HTTPException
from torrents.constants import (
    PREFETCH_HIGH_PIECES,
    PRIO_HIGH,
    PRIO_LOW,
    PRIO_MEDIUM,
    PRIO_NORMAL,
    PRIO_SKIP,
)
from torrents.schemas import (
    AddTorrent,
    File,
    PrioritizeAndWait,
    PrioritizeAndWaitRequest,
    StreamPiece,
    Torrent,
    TorrentStatus,
    UpdateSettings,
)

logger = logging.getLogger(__name__)


class TorrentsService:
    def __init__(self) -> None:
        self.libtorrent_session = libtorrent.session()

        self.libtorrent_session.apply_settings(
            {
                "enable_upnp": False,
                "enable_natpmp": False,
                "enable_dht": False,
                "connections_limit": 1000,
            }
        )

        self._torrent_statuses: Dict[libtorrent.sha1_hash, TorrentStatus] = {}

    def update_settings(
        self,
        payload: UpdateSettings,
    ):
        apply_settings: Dict[str, Any] = {}

        if payload.upload_rate_limit is not None:
            apply_settings["upload_rate_limit"] = payload.upload_rate_limit

        if payload.download_rate_limit is not None:
            apply_settings["download_rate_limit"] = payload.download_rate_limit

        self.libtorrent_session.apply_settings(apply_settings)

        # libtorrent port konfiguráció
        if payload.port is not None:
            self.libtorrent_session.listen_on(payload.port, payload.port)  # type: ignore[call-arg]

    def get_torrents(self) -> List[Torrent]:
        torrents = self.libtorrent_session.get_torrents()

        return [self._build_torrent(torrent) for torrent in torrents]

    def get_torrent_handle(
        self, info_hash: libtorrent.sha1_hash
    ) -> libtorrent.torrent_handle | None:
        torrent_handle = self.libtorrent_session.find_torrent(info_hash)

        if not torrent_handle.is_valid():
            return None

        return torrent_handle

    def get_torrent_handle_or_raise(
        self, info_hash: libtorrent.sha1_hash
    ) -> libtorrent.torrent_handle:
        torrent_handle = self.get_torrent_handle(info_hash=info_hash)

        if torrent_handle is None:
            raise HTTPException(404, f'"{info_hash}" torrent nem található.')

        return torrent_handle

    def get_torrent_or_raise(self, info_hash: libtorrent.sha1_hash) -> Torrent:
        torrent_handle = self.get_torrent_handle_or_raise(info_hash=info_hash)
        return self._build_torrent(torrent_handle)

    def add_torrent(self, req: AddTorrent) -> Torrent:
        save_path = os.path.abspath(req.save_path)
        torrent_file_path = os.path.abspath(req.torrent_file_path)

        if not os.path.isfile(torrent_file_path):
            raise HTTPException(
                400, f'A(z) "{torrent_file_path}" torrent fájl nem található.'
            )

        torrent_info = libtorrent.torrent_info(torrent_file_path)
        info_hash = torrent_info.info_hash()

        existing_torrent_handle = self.get_torrent_handle(info_hash)
        if existing_torrent_handle is not None:
            self._build_torrent(existing_torrent_handle)

        torrent_info = libtorrent.torrent_info(torrent_file_path)

        os.makedirs(save_path, exist_ok=True)

        params = libtorrent.add_torrent_params()
        params.ti = torrent_info
        params.save_path = save_path
        params.storage_mode = libtorrent.storage_mode_t.storage_mode_sparse
        # params.storage_mode = 0

        torrent_handle = self.libtorrent_session.add_torrent(params)
        # torrent_handle.set_max_connections(20)

        is_valid = False

        checking = self._check_torrent_checking(
            torrent_handle=torrent_handle,
        )

        deadline = time.monotonic() + 5.0
        while time.monotonic() < deadline:
            is_valid = torrent_handle.is_valid()
            if is_valid:
                break

            time.sleep(0.5)

        if not is_valid:
            self.libtorrent_session.remove_torrent(
                torrent_handle,
                libtorrent.options_t.delete_files,
            )
            raise HTTPException(
                500,
                f'A(z) "{torrent_file_path}" .torrent-et nem sikerült hozzáadni.',
            )

        priority = PRIO_SKIP
        if req.download_full_torrent:
            priority = PRIO_LOW

        priorities = torrent_handle.piece_priorities()

        for i in range(len(priorities)):
            priorities[i] = priority

        torrent_handle.prioritize_pieces(priorities)

        self._torrent_statuses[info_hash] = TorrentStatus(
            default_priorities=priorities,
        )

        checking = True
        while checking:
            checking = self._check_torrent_checking(
                torrent_handle=torrent_handle,
            )
            time.sleep(1.0)

        return self._build_torrent(torrent_handle)

    def remove_torrent(self, info_hash: libtorrent.sha1_hash) -> Torrent:
        torrent_handle = self.get_torrent_handle_or_raise(info_hash=info_hash)

        self.libtorrent_session.remove_torrent(
            torrent_handle,
            libtorrent.options_t.delete_files,
        )
        return self._build_torrent(torrent_handle)

    def get_torrent_file(
        self,
        info_hash: libtorrent.sha1_hash,
        file_index: int,
    ) -> File:
        torrent_handle = self.get_torrent_handle_or_raise(info_hash=info_hash)

        self._check_torrent_checking_or_raise(torrent_handle=torrent_handle)

        torrent_file = torrent_handle.torrent_file()

        if torrent_file is None:
            raise HTTPException(404, f'A(z) "{info_hash}" torrent nem található.')

        files = torrent_file.files()
        if file_index >= files.num_files():
            raise HTTPException(
                404, f'A(z) "{info_hash}, {file_index}" fájl nem található.'
            )

        file_size = files.file_size(file_index)
        file_entry = torrent_file.file_at(file_index)

        is_available = self._check_file_available(
            torrent_handle=torrent_handle,
            file_index=file_index,
        )

        file = File(
            info_hash=str(torrent_handle.info_hash()),
            file_index=file_index,
            piece_length=torrent_file.piece_length(),
            path=file_entry.path,
            offset=file_entry.offset,
            size=file_size,
            is_available=is_available,
        )

        return file

    def parse_info_hash(self, info_hash_str: str) -> libtorrent.sha1_hash:
        sha1_hash = libtorrent.sha1_hash(bytes.fromhex(info_hash_str))
        return sha1_hash

    def prioritize_and_wait(
        self,
        info_hash: libtorrent.sha1_hash,
        stream_id: str,
        file_index: int,
        req: PrioritizeAndWaitRequest,
    ):
        prioritize_start_byte = req.start_byte

        torrent_handle = self.get_torrent_handle_or_raise(info_hash=info_hash)

        self._check_torrent_checking_or_raise(torrent_handle=torrent_handle)

        priorities = torrent_handle.piece_priorities()

        # Torrent Fájl
        torrent_file = torrent_handle.torrent_file()

        if torrent_file is None:
            raise HTTPException(409, "A torrent nem használható.")

        files = torrent_file.files()

        if file_index < 0 or file_index >= files.num_files():
            raise HTTPException(400, "File index out of range")

        torrent_status = self._torrent_statuses.get(info_hash)
        if torrent_status and not torrent_status.stream_pieces:
            self._set_file_pieces_priorities(
                priorities=priorities,
                torrent_file=torrent_file,
                file_index=file_index,
                priority=PRIO_SKIP,
            )

        torrent_piece_size = torrent_file.piece_length()
        file_offset = files.file_offset(file_index)
        file_size = files.file_size(file_index)

        null_based_file_size = file_size - 1
        file_end_piece_index = (
            file_offset + null_based_file_size
        ) // torrent_piece_size

        # Kritikus piece index megkeresése
        stream_piece_index = (prioritize_start_byte + file_offset) // torrent_piece_size

        is_available = self._check_file_available(
            torrent_handle=torrent_handle,
            file_index=file_index,
        )

        available_end_byte = (
            (stream_piece_index + 1) * torrent_piece_size
        ) - file_offset

        prioritize_and_wait = PrioritizeAndWait(
            available_end_byte=available_end_byte,
            is_available=is_available,
        )

        if is_available:
            prioritize_and_wait.available_end_byte = null_based_file_size
            return prioritize_and_wait

        # Prefetch beállítása
        self._set_prefetch_priorities(
            info_hash=info_hash,
            stream_id=stream_id,
            priorities=priorities,
            file_end_piece_index=file_end_piece_index,
            stream_piece_index=stream_piece_index,
        )

        torrent_handle.prioritize_pieces(priorities)

        # Kritikus piece kérése
        for index in range(4):
            if stream_piece_index + index > file_end_piece_index:
                break
            torrent_handle.set_piece_deadline(stream_piece_index + index, 50 * index)

        piece_is_ready = False

        max_wait_seconds = 60.0
        poll_interval = 0.1
        max_checks = int(max_wait_seconds / poll_interval)
        checks = 0

        while not piece_is_ready:
            if checks >= max_checks:
                raise HTTPException(
                    504, "A stream-et nem sikerült időben elindítani, próbáld újra."
                )

            piece_is_ready = self._check_piece_available(
                torrent_handle=torrent_handle,
                piece_index=stream_piece_index,
            )

            if not piece_is_ready:
                self._set_prefetch_priorities(
                    info_hash=info_hash,
                    stream_id=stream_id,
                    priorities=priorities,
                    file_end_piece_index=file_end_piece_index,
                    stream_piece_index=stream_piece_index,
                )
                torrent_handle.prioritize_pieces(priorities)

                for index in range(4):
                    if stream_piece_index + index > file_end_piece_index:
                        break
                    torrent_handle.set_piece_deadline(
                        stream_piece_index + index, 50 * index
                    )

                logger.info(
                    "stream_piece_index: %s, priority: %s",
                    stream_piece_index,
                    priorities[stream_piece_index],
                )

                time.sleep(poll_interval)
                checks += 1

        return prioritize_and_wait

    def reset_pieces_priorities(
        self,
        info_hash: libtorrent.sha1_hash,
        stream_id: str,
    ) -> None:
        torrent_handle = self.get_torrent_handle_or_raise(info_hash=info_hash)

        self._check_torrent_checking_or_raise(torrent_handle=torrent_handle)

        torrent_status = self._torrent_statuses.get(info_hash)

        if torrent_status:
            torrent_status.stream_pieces.pop(stream_id, None)

            if not torrent_status.stream_pieces:
                torrent_handle.prioritize_pieces(torrent_status.default_priorities)

    def _set_prefetch_priorities(
        self,
        info_hash: libtorrent.sha1_hash,
        stream_id: str,
        priorities: List[int],
        file_end_piece_index: int,
        stream_piece_index: int,
    ):
        # Előző prioritások levétele
        torrent_status = self._torrent_statuses.get(info_hash)
        if torrent_status:
            torrent_status.stream_pieces.pop(stream_id, None)

        # Előtöltés beállítása
        prefetch_high_start_piece_index = stream_piece_index
        prefetch_high_end_piece_index = (
            prefetch_high_start_piece_index + PREFETCH_HIGH_PIECES
        )

        self._set_pieces_priorities(
            priorities=priorities,
            file_end_piece_index=file_end_piece_index,
            start_piece_index=prefetch_high_start_piece_index,
            end_piece_index=prefetch_high_end_piece_index,
            priority=PRIO_HIGH,
        )

        prefetch_medium_start_piece_index = prefetch_high_end_piece_index
        prefetch_medium_end_piece_index = prefetch_medium_start_piece_index + 16

        self._set_pieces_priorities(
            priorities=priorities,
            file_end_piece_index=file_end_piece_index,
            start_piece_index=prefetch_medium_start_piece_index,
            end_piece_index=prefetch_medium_end_piece_index,
            priority=PRIO_MEDIUM,
        )

        prefetch_normal_start_piece_index = prefetch_medium_end_piece_index
        prefetch_normal_end_piece_index = prefetch_normal_start_piece_index + 32

        self._set_pieces_priorities(
            priorities=priorities,
            file_end_piece_index=file_end_piece_index,
            start_piece_index=prefetch_normal_start_piece_index,
            end_piece_index=prefetch_normal_end_piece_index,
            priority=PRIO_NORMAL,
        )

        # Aktuális prioritások beállítása
        if torrent_status:
            stream_piece = StreamPiece(
                start_piece_index=prefetch_high_start_piece_index,
                end_piece_index=prefetch_normal_end_piece_index,
            )
            torrent_status.stream_pieces[stream_id] = stream_piece

    def _set_file_pieces_priorities(
        self,
        priorities: List[int],
        torrent_file: libtorrent.torrent_info,
        file_index: int,
        priority: int,
    ):
        files = torrent_file.files()

        piece_size = int(torrent_file.piece_length())

        file_offset = int(files.file_offset(file_index))
        file_size = int(files.file_size(file_index))

        file_start_piece_index = file_offset // piece_size
        file_end_piece_index = (file_offset + file_size - 1) // piece_size

        self._set_pieces_priorities(
            priorities=priorities,
            file_end_piece_index=file_end_piece_index,
            start_piece_index=file_start_piece_index,
            end_piece_index=file_end_piece_index + 1,
            priority=priority,
        )

    # A end_piece_index-ig állítja be, tehát az end_piece_index már nem kerül beállítása
    def _set_pieces_priorities(
        self,
        priorities: List[int],
        file_end_piece_index: int,
        start_piece_index: int,
        end_piece_index: int,
        priority: int,
    ):
        if start_piece_index > file_end_piece_index:
            pass

        for piece_index in range(start_piece_index, end_piece_index):
            if piece_index > file_end_piece_index:
                break
            priorities[piece_index] = priority

    def _check_file_available(
        self,
        torrent_handle: libtorrent.torrent_handle,
        file_index: int,
    ) -> bool:
        torrent_file = torrent_handle.torrent_file()
        if torrent_file is None:
            return False

        file_progress = torrent_handle.file_progress()
        file_entry = torrent_file.file_at(file_index)

        file_size = file_entry.size
        is_available = file_progress[file_index] == file_size
        return is_available

    def _check_piece_available(
        self,
        torrent_handle: libtorrent.torrent_handle,
        piece_index: int,
    ) -> bool:
        return torrent_handle.have_piece(piece_index)

    def _check_torrent_checking(
        self,
        torrent_handle: libtorrent.torrent_handle,
    ) -> bool:
        torrent_status = torrent_handle.status()

        checking = False
        if torrent_status.state in (
            libtorrent.torrent_status.checking_files,
            libtorrent.torrent_status.checking_resume_data,
        ):
            checking = True
        return checking

    def _check_torrent_checking_or_raise(
        self,
        torrent_handle: libtorrent.torrent_handle,
    ):
        torrent_name = torrent_handle.name()
        checking = self._check_torrent_checking(
            torrent_handle=torrent_handle,
        )

        if checking:
            raise HTTPException(
                400, f"A(z) {torrent_name} még nem használható, ellenörzés alatt áll."
            )

    def _build_torrent(
        self,
        torrent_handle: libtorrent.torrent_handle,
    ) -> Torrent:
        status = torrent_handle.status()

        return Torrent(
            name=status.name,
            info_hash=str(status.info_hash),
            download_speed=status.download_rate,
            upload_speed=status.upload_rate,
            downloaded=status.total_done,
            uploaded=status.total_upload,
            progress=status.progress,
            total=status.total,
        )
