/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StreamsResponseDto } from '../models/StreamsResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class StremioStreamService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @param mediaType
     * @param id
     * @param token Stremio addon token
     * @returns StreamsResponseDto
     * @throws ApiError
     */
    public stremioStreamControllerStreams(
        mediaType: 'series' | 'movie',
        id: string,
        token: string,
    ): CancelablePromise<StreamsResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/{token}/stream/{mediaType}/{id}.json',
            path: {
                'mediaType': mediaType,
                'id': id,
                'token': token,
            },
        });
    }
    /**
     * @param tracker
     * @param torrentId
     * @param infoHash
     * @param fileIdx
     * @param token Stremio addon token
     * @returns any
     * @throws ApiError
     */
    public stremioStreamControllerPlayStream(
        tracker: 'ncore',
        torrentId: string,
        infoHash: string,
        fileIdx: number,
        token: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/{token}/stream/play/{tracker}/{torrentId}/{infoHash}/{fileIdx}',
            path: {
                'tracker': tracker,
                'torrentId': torrentId,
                'infoHash': infoHash,
                'fileIdx': fileIdx,
                'token': token,
            },
        });
    }
}
