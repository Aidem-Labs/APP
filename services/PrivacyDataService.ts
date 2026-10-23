import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const escapeHtml = (value: unknown): string => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatDate = (value: unknown) => value ? new Date(String(value)).toLocaleString() : '—';

export async function createPrivacyExportPdf(data: any): Promise<string> {
  const profile = data.profile || {};
  const journalEntries = data.journalEntries || [];
  const summaries = data.aiSummaries || [];
  const conversations = data.aiConversations || [];
  const organisationLabel = profile.organisation_type === 'college' ? 'College' : 'Clinic';
  const organisationDetails = profile.organisation_name
    ? `<br/><strong>${organisationLabel}:</strong> ${escapeHtml(profile.organisation_name)}`
    : '';
  const section = (title: string, content: string) => `<section><h2>${escapeHtml(title)}</h2>${content || '<p>No records.</p>'}</section>`;
  const journalHtml = journalEntries.map((entry: any) => `<article><h3>${escapeHtml(entry.title || 'Journal entry')}</h3><p class="meta">${formatDate(entry.created_at || entry.timestamp)}${entry.mood ? ` · Mood: ${escapeHtml(entry.mood)}` : ''}</p><p>${escapeHtml(entry.content || entry.transcribed_text).replace(/\n/g, '<br/>')}</p></article>`).join('');
  const summariesHtml = summaries.map((summary: any) => `<article><h3>${escapeHtml(summary.type || 'Summary')}</h3><p class="meta">${formatDate(summary.created_at)}</p><p>${escapeHtml(summary.summary_text).replace(/\n/g, '<br/>')}</p></article>`).join('');
  const conversationsHtml = conversations.map((message: any) => `<article><h3>${escapeHtml(message.role === 'assistant' ? 'METAT8' : 'You')}</h3><p class="meta">${formatDate(message.created_at)}</p><p>${escapeHtml(message.content).replace(/\n/g, '<br/>')}</p></article>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;color:#172033;padding:24px;line-height:1.45}h1{color:#442f8f}h2{margin-top:28px;color:#27364f;border-bottom:1px solid #dbe1ea;padding-bottom:6px}h3{font-size:14px;margin-bottom:2px}.meta{font-size:11px;color:#667085;margin-top:0}article{break-inside:avoid;border:1px solid #e6e9ef;border-radius:8px;padding:12px;margin:10px 0}p{white-space:normal}</style></head><body><h1>METAT8 Personal Data Export</h1><p class="meta">Created: ${formatDate(data.exportedAt)} · Account type: ${escapeHtml(data.accountType)}</p>${section('Profile', `<p><strong>Name:</strong> ${escapeHtml(profile.name)}<br/><strong>Email:</strong> ${escapeHtml(profile.email)}<br/><strong>Username:</strong> ${escapeHtml(profile.username)}${organisationDetails}</p>`)}${section('Journal entries', journalHtml)}${section('AI summaries', summariesHtml)}${section('AI conversations', conversationsHtml)}</body></html>`;
  const result = await Print.printToFileAsync({ html, base64: Platform.OS === 'android' });
  if (!result.uri) throw new Error('PDF file could not be created');

  let savedUri = result.uri;
  if (Platform.OS === 'android') {
    const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permission.granted) throw new Error('Choose a folder to save the PDF before deleting your data.');
    if (!result.base64) throw new Error('PDF file could not be prepared for saving.');
    const filename = `metat8-data-export-${Date.now()}`;
    savedUri = await FileSystem.StorageAccessFramework.createFileAsync(
      permission.directoryUri,
      filename,
      'application/pdf'
    );
    await FileSystem.StorageAccessFramework.writeAsStringAsync(savedUri, result.base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else if (FileSystem.documentDirectory) {
    savedUri = `${FileSystem.documentDirectory}metat8-data-export-${Date.now()}.pdf`;
    await FileSystem.copyAsync({ from: result.uri, to: savedUri });
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf', dialogTitle: 'Your METAT8 data export is ready' });
  }
  return savedUri;
}
