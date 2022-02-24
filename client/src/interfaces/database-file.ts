export interface DatabaseFile {
  id: number;

  filename: string;

  data: {
    data: Uint8Array;

    type: string;
  };
}
