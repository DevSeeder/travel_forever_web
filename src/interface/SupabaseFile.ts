export interface SupabaseFile {
  type: string;
  fileName: string;
  extension: string;
  data?: {
    fullPath?: string;
    path?: string;
    Id?: string;
  };
  uploadDate: Date;
  inactivationDate: Date;
  active: boolean;
}
