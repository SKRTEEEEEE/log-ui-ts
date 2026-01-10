import { describe, it, expect } from 'vitest';
import * as uploadthing from '@log-ui/lib/uploadthing';

describe('uploadthing', () => {
    it('should export generated helpers and components', () => {
        expect(uploadthing.useUploadThing).toBeDefined();
        expect(uploadthing.uploadFiles).toBeDefined();
        expect(uploadthing.UploadButton).toBeDefined();
        expect(uploadthing.UploadDropzone).toBeDefined();
    });
});
