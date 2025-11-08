/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SettingDto } from '../models/SettingDto';
import type { UpdateSettingDto } from '../models/UpdateSettingDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SettingsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns SettingDto
     * @throws ApiError
     */
    public settingsControllerFindOne(): CancelablePromise<SettingDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/settings',
        });
    }
    /**
     * @param requestBody
     * @returns SettingDto
     * @throws ApiError
     */
    public settingsControllerUpdate(
        requestBody: UpdateSettingDto,
    ): CancelablePromise<SettingDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/settings',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
