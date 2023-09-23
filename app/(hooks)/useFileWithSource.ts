import { useState } from "react";

type FileWithSource = {
  file: File | null;
  source: string;
};

export const useFileWithSource = (): [FileWithSource, (e: any) => void] => {
  const [fileData, setFileData] = useState<FileWithSource>({
    file: null,
    source: "",
  });

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    const objectURL = URL.createObjectURL(file);
    setFileData({
      file,
      source: objectURL,
    });
  };

  return [fileData, handleFileChange];
};
