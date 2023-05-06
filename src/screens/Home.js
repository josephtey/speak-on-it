import react from "react";
import { Button, Form, Input, Tag, InputNumber, Card } from "antd";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../utils/firebase";

const { TextArea } = Input;

const Home = (props) => {
  // const [isUploading, setIsUploading] = useState(false);
  // const [openFileSelector, { plainFiles, loading }] = useFilePicker({
  //   multiple: false,
  //   readFilesContent: false,
  // });

  // useEffect(() => {
  //   if (plainFiles.length > 0 && !isUploading) {
  //     const firstFile = plainFiles[0];
  //     setIsUploading(true);
  //     uploadImg(firstFile);
  //   }
  // }, [plainFiles]);

  // const handleFileUpload = (event) => {
  //   event.stopPropagation();

  //   if (!isUploading) {
  //     openFileSelector();
  //   }
  // };

  // const uploadImg = (file) => {
  //   const storageRef = ref(storage, file.name);

  //   const uploadTask = uploadBytesResumable(storageRef, file);

  //   Swal.fire({
  //     title: `Uploading new file...`,
  //     toast: true,
  //     showClass: {
  //       popup: "none",
  //     },
  //     showConfirmButton: false,
  //   });

  //   uploadTask.on(
  //     "state_changed",
  //     (snapshot) => {
  //       let progress =
  //         Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //       progress = Math.min(99, progress);
  //     },
  //     (error) => {
  //       setIsUploading(false);
  //     },
  //     () => {
  //       getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
  //         Swal.fire({
  //           title: `Success!`,
  //           toast: true,
  //           showClass: {
  //             popup: "none",
  //           },
  //           icon: "success",
  //           timer: 1000,
  //           timerProgressBar: true,
  //           showConfirmButton: false,
  //         });
  //       });
  //       setIsUploading(false);
  //     }
  //   );
  // };
  const handleSubmit = async () => {
    const values = form.getFieldsValue(true);

    const essaysRef = collection(db, "essays");
    const newDoc = await addDoc(essaysRef, {
      essay: values.essay,
      prompt: values.essayPrompt,
    });

    props.history.push("/chat/" + newDoc.id);
  };
  const [form] = Form.useForm();
  return (
    <div className="flex w-full justify-center content-center h-screen flex-wrap flex-col">
      <div
        className="text-6xl text-center font-bold mb-8 mx-32"
        style={{
          lineHeight: "70px",
        }}
      >
        Speak on it!
      </div>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={async () => {
          await handleSubmit();
        }}
        className="py-16"
      >
        <Form.Item
          label="Paste the prompt of your essay here"
          name="essayPrompt"
          rules={[{ required: true, message: "Your prompt can't be empty!" }]}
        >
          <Input placeholder="e.g. The task of this essay is to ..." />
        </Form.Item>

        <Form.Item
          label="Paste your essay here"
          name="essay"
          rules={[
            {
              required: true,
              message: "Your essay can't be empty!",
            },
          ]}
        >
          <TextArea
            maxLength={1500}
            showCount
            rows={10}
            placeholder="e.g. The attack commenced at 7:48 a.m. Hawaiian Time (6:18 p.m. GMT). The base was attacked by 353 Imperial Japanese aircraft (including fighters, level and dive bombers, and torpedo bombers) in two waves, launched from six aircraft carriers. Of the eight U.S. Navy battleships present, all were damaged, with four sunk. All but USS Arizona were later raised, and six were returned to service and went on to fight in the war. The Japanese also sank or damaged three cruisers, three destroyers, an anti-aircraft training ship, and one minelayer. More than 180 US aircraft were destroyed. 2,403 Americans were killed and 1,178 others were wounded. Important base installations such as the power station, dry dock, shipyard, maintenance, and fuel and torpedo storage facilities, as well as the submarine piers and headquarters building (also home of the intelligence section) were not attacked. Japanese losses were light: 29 aircraft and five midget submarines lost, and 64 servicemen killed. Kazuo Sakamaki, the commanding officer of one of the submarines, was captured."
          />
        </Form.Item>
      </Form>
      <div
        className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-center mb-4"
        onClick={() => {
          form.submit();
        }}
        htmlType="submit"
      >
        Speak!
      </div>
    </div>
  );
};

export default Home;
