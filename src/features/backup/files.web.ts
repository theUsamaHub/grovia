export async function shareBackup(
  text: string,
  kind: 'backup' | 'summary' = 'backup',
) {
  const url = URL.createObjectURL(
    new Blob([text], {
      type: kind === 'backup' ? 'application/json' : 'text/plain',
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = 'grovia-' + kind + (kind === 'backup' ? '.json' : '.txt');
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function chooseBackup(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.oncancel = () => resolve(null);
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      if (file.size > 10000000) {
        reject(Error('Choose a backup smaller than 10 MB.'));
        return;
      }
      file.text().then(resolve, reject);
    };
    input.click();
  });
}
