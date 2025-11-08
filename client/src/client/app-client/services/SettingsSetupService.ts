/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSetupDto } from '../models/CreateSetupDto';
import type { StatusDto } from '../models/StatusDto';
import type { UserDto } from '../models/UserDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SettingsSetupService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @param requestBody
     * @returns UserDto
     * @throws ApiError
     */
    public setupControllerCreate(
        requestBody: CreateSetupDto,
    ): CancelablePromise<UserDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/settings/setup',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns StatusDto
     * @throws ApiError
     */
    public setupControllerStatus(): CancelablePromise<StatusDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/settings/setup/status',
        });
    }
}
