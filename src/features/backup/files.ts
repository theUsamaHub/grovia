import { File, Paths } from 'expo-file-system';
import { getDocumentAsync } from 'expo-document-picker';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
export async function shareBackup(text: string) {
  if (!(await isAvailableAsync()))
    throw Error('Sharing is unavailable on this device.');
  const file = new File(Paths.cache, 'grovia-backup-' + Date.now() + '.json');
  file.write(text);
  try {
    await shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Save your Grovia backup',
    });
  } finally {
    if (file.exists) file.delete();
  }
}
export async function chooseBackup() {
  const result = await getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const file = new File(result.assets[0].uri);
  if (file.size > 10000000) throw Error('Choose a backup smaller than 10 MB.');
  return file.text();
}
