import path from 'path';
import findInFiles from 'find-in-files';

describe('test', () => {
  it('check translations', async () => {
    // eslint-disable-next-line no-template-curly-in-string
    const exceptions: string[] = ['webhook_${userWebhookType}'];

    const translationsNeededOccurrences = await findInFiles.find(
      /(?:this\.)?\$t.?\(.+\)/,
      path.join(process.cwd(), 'pages')
    );

    const translationsNeeded: string[] = [];

    Object.values(translationsNeededOccurrences).forEach((occurrence) => {
      occurrence.matches.forEach((match) => {
        const translation = match.match(/(?:'|"|`)(.+)(?:'|"|`)/)?.[1];
        if (translation && !exceptions.includes(translation)) {
          translationsNeeded.push(translation);
        }
      });
    });

    const translationsFoundOccurences = await findInFiles.find(
      /(.+):/,
      path.join(process.cwd(), 'locales')
    );

    const translationsFound: string[] = [];

    Object.values(translationsFoundOccurences).forEach((occurrence) => {
      occurrence.matches.forEach((match) => {
        const translation = match.match(/^(?:\t| )([a-z\d_]+?):/)?.[1];
        if (translation && !exceptions.includes(translation)) {
          translationsFound.push(translation);
        }
      });
    });

    const translationsNeededSet = [...new Set(translationsNeeded)];
    const translationsFoundSet = [...new Set(translationsFound)];

    expect(translationsFoundSet.sort()).toEqual(translationsNeededSet.sort());
  });
});
