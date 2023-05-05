import react, { useEffect, useState, useCallback } from "react";
import "react-dropzone-uploader/dist/styles.css";
import { useFilePicker } from "use-file-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Swal from "sweetalert2";
import { storage } from "../utils/firebase";

const Home = (props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [openFileSelector, { plainFiles, loading }] = useFilePicker({
    multiple: false,
    readFilesContent: false,
  });

  useEffect(() => {
    if (plainFiles.length > 0 && !isUploading) {
      const firstFile = plainFiles[0];
      setIsUploading(true);
      uploadImg(firstFile);
    }
  }, [plainFiles]);

  const handleFileUpload = (event) => {
    event.stopPropagation();

    if (!isUploading) {
      openFileSelector();
    }
  };

  const uploadImg = (file) => {
    const storageRef = ref(storage, file.name);

    const uploadTask = uploadBytesResumable(storageRef, file);

    Swal.fire({
      title: `Uploading new file...`,
      toast: true,
      showClass: {
        popup: "none",
      },
      showConfirmButton: false,
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        let progress =
          Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progress = Math.min(99, progress);
      },
      (error) => {
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          Swal.fire({
            title: `Success!`,
            toast: true,
            showClass: {
              popup: "none",
            },
            icon: "success",
            timer: 1000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        });
        setIsUploading(false);
      }
    );
  };

  return (
    <div className="flex w-full justify-center content-center h-screen flex-wrap flex-col">
      <div
        className="text-6xl text-center font-bold mb-8"
        style={{
          lineHeight: "70px",
        }}
      >
        Speak on it!
      </div>

      <div
        className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-center mb-4"
        onClick={handleFileUpload}
      >
        Upload!
      </div>
    </div>
  );
};

export default Home;
