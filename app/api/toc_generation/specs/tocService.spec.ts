import { testingDB } from 'api/utils/testing_db';
import request from 'shared/JSONRequest';
import { files } from 'api/files';
import { elasticTesting } from 'api/utils/elastic_testing';
import { fixtures } from './fixtures';
import { tocService } from '../tocService';

describe('tocService', () => {
  const service = tocService('url');
  beforeAll(async () => {
    spyOn(request, 'uploadFile').and.callFake(async (url, filename) => {
      expect(url).toBe('url');
      if (filename === 'pdf1.pdf') {
        return Promise.resolve([{ label: 'section1 pdf1' }]);
      }
      if (filename === 'pdf3.pdf') {
        return Promise.resolve([{ label: 'section1 pdf3' }]);
      }
      throw new Error(`this file is not supposed to be sent for toc generation ${filename}`);
    });
  });

  afterAll(async () => {
    await testingDB.disconnect();
  });

  describe('processNext', () => {
    beforeAll(async () => {
      const elasticIndex = 'toc.service.index';
      await testingDB.clearAllAndLoad(fixtures, elasticIndex);
      await elasticTesting.resetIndex();
      await service.processNext();
      await service.processNext();
      await elasticTesting.refresh();
    });

    it('should not fail when there is no more to process', async () => {
      await expect(service.processNext()).resolves.not.toThrow();
    });

    it('should send the next pdfFile and save toc generated', async () => {
      let [fileProcessed] = await files.get({ filename: 'pdf1.pdf' });
      expect(fileProcessed.toc).toEqual([{ label: 'section1 pdf1' }]);
      expect(fileProcessed.generatedToc).toEqual(true);

      [fileProcessed] = await files.get({ filename: 'pdf3.pdf' });
      expect(fileProcessed.toc).toEqual([{ label: 'section1 pdf3' }]);
      expect(fileProcessed.generatedToc).toEqual(true);
    });

    it('should reindex the affected entities', async () => {
      const entitiesIndexed = await elasticTesting.getIndexedEntities();

      expect(entitiesIndexed).toEqual([
        expect.objectContaining({
          title: 'pdf1entity',
          generatedToc: true,
        }),
        expect.objectContaining({
          title: 'pdf3entity',
          generatedToc: true,
        }),
      ]);
    });
  });
});