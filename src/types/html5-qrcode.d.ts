declare module 'html5-qrcode' {
  export const Html5Qrcode: {
    scanFileV2: (
      filePathOrUrl: string,
      showLogs?: boolean,
    ) => Promise<{ decodedText?: string }>;
  };
}
