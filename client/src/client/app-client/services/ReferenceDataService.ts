/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReferenceDataDto } from '../models/ReferenceDataDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ReferenceDataService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns ReferenceDataDto
     * @throws ApiError
     */
    public referenceDataControllerReferenceData(): CancelablePromise<ReferenceDataDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/reference-data',
        });
    }
}
