import react, { useState } from "react";
import { Button, Form, Input, Tag, InputNumber, Card } from "antd";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../utils/firebase";
import { Radio } from "antd";
import { sampleCodeAss } from "../consts/assns";

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
  const handleModeChange = (e) => {
    setMode(e.target.value);
  };

  const [mode, setMode] = useState("essay");

  const handleSubmitCode = async () => {
    const values = codeForm.getFieldsValue(true);

    const codeRef = collection(db, "assns");
    const newDoc = await addDoc(codeRef, {
      name: values.name,
      code: values.code,
      codeAssignment: values.codeAssignment,
      type: "code",
    });

    props.history.push("/chat/" + newDoc.id);
  };
  const handleSubmitEssay = async () => {
    const values = essayForm.getFieldsValue(true);

    const essaysRef = collection(db, "assns");
    const newDoc = await addDoc(essaysRef, {
      name: values.name,
      essay: values.essay,
      prompt: values.essayPrompt,
      type: "essay",
    });

    props.history.push("/chat/" + newDoc.id);
  };
  const [essayForm] = Form.useForm();
  const [codeForm] = Form.useForm();
  return (
    <div className="flex w-full items-center h-screen flex-wrap flex-col flex-nowrap">
      <div
        className="text-6xl text-center font-bold mb-4 mx-32 mt-32"
        style={{
          lineHeight: "70px",
        }}
      >
        Speak On It
      </div>
      <p className="text-center text-lg text-gray-400">
        Evaluation through Conversation
      </p>
      <Radio.Group onChange={handleModeChange} value={mode} className="my-8">
        <Radio.Button value="essay">Essay</Radio.Button>
        <Radio.Button value="code">Code</Radio.Button>
      </Radio.Group>
      {mode === "essay" ? (
        <div className="mb-16 flex w-full flex-col items-center">
          <Form
            form={essayForm}
            layout="vertical"
            autoComplete="off"
            onFinish={async () => {
              await handleSubmitEssay();
            }}
            className="py-16 w-1/2"
          >
            <Form.Item
              label="What's your name?"
              name="name"
              rules={[{ required: true, message: "Your name can't be empty!" }]}
            >
              <Input placeholder="e.g. Bob" />
            </Form.Item>
            <Form.Item
              label="Paste the prompt of your essay here"
              name="essayPrompt"
              rules={[
                { required: true, message: "Your prompt can't be empty!" },
              ]}
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
                showCount
                rows={10}
                placeholder="e.g. The attack commenced at 7:48 a.m. Hawaiian Time (6:18 p.m. GMT). The base was attacked by 353 Imperial Japanese aircraft (including fighters, level and dive bombers, and torpedo bombers) in two waves, launched from six aircraft carriers. Of the eight U.S. Navy battleships present, all were damaged, with four sunk. All but USS Arizona were later raised, and six were returned to service and went on to fight in the war. The Japanese also sank or damaged three cruisers, three destroyers, an anti-aircraft training ship, and one minelayer. More than 180 US aircraft were destroyed. 2,403 Americans were killed and 1,178 others were wounded. Important base installations such as the power station, dry dock, shipyard, maintenance, and fuel and torpedo storage facilities, as well as the submarine piers and headquarters building (also home of the intelligence section) were not attacked. Japanese losses were light: 29 aircraft and five midget submarines lost, and 64 servicemen killed. Kazuo Sakamaki, the commanding officer of one of the submarines, was captured."
              />
            </Form.Item>
          </Form>
          <div
            className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-center mb-16"
            onClick={() => {
              essayForm.submit();
            }}
            htmlType="submit"
          >
            Try Now!
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-8 w-full px-48 py-8">
          {/* <p className="w-1/2 h-screen overflow-scroll">
            <h1>The Game of Nimm</h1>
            Nimm is an ancient game of strategy that is named after the old
            German word for "take." It is also called Tiouk Tiouk in West Africa
            and Tsynshidzi in China. Players alternate taking stones until there
            are zero left. The game of Nimm goes as follows: <br />
            <br />
            <ol>
              <li>
                1. The game starts with a pile of 20 stones between the players
              </li>
              <li>2. The two players alternate turns </li>
              <li>
                3. On a given turn, a player may take either 1 or 2 stone from
                the center pile 4.{" "}
              </li>
              <li>
                4. The two players continue until the center pile has run out of
                stones.{" "}
              </li>
            </ol>
            <br />
            The last player to take a stone loses. To make your life easier we
            have broken the problem down into smaller milestones. You have a lot
            of time for this program. Take it slowly, piece by piece.
            <h2>Milestone 1</h2>
            Start with 20 stones. Repeat the process of removing stones and
            printing out how many stones are left until there are zero. Don't
            worry about whose turn it is. Don't worry about making sure only one
            or two stones are removed. Use the method readInt(msg) which prints
            msg and waits for the user to enter a number.
            <h2>Milestone 2</h2>
            Create a variable of type int to keep track of whose turn it is
            (remember there are two players). Tell the user whose turn it is.
            Each time someone picks up stones, change the player number.
            <h2>Milestone 3</h2>
            Make sure that each turn only one or two stones are removed. After
            you read a number of stones to remove from a user (their input), you
            can use the following pattern to check if it was valid and keep
            asking until it is valid.
            <h2>Milestone 4</h2>
            Announce the winner.
          </p> */}
          <div className="mb-16 flex w-full flex-col items-center">
            <Form
              form={codeForm}
              layout="vertical"
              autoComplete="off"
              onFinish={async () => {
                await handleSubmitCode();
              }}
              className="py-16 w-full"
            >
              <Form.Item
                label="What's your name?"
                name="name"
                rules={[
                  { required: true, message: "Your name can't be empty!" },
                ]}
              >
                <Input placeholder="e.g. Bob" />
              </Form.Item>
              <Form.Item
                label="Paste your assignment here"
                name="codeAssignment"
                rules={[
                  {
                    required: true,
                    message: "Your assignment can't be empty!",
                  },
                ]}
              >
                <TextArea showCount rows={10} />
              </Form.Item>
              <Form.Item
                label="Paste your code here"
                name="code"
                rules={[
                  {
                    required: true,
                    message: "Your code can't be empty!",
                  },
                ]}
              >
                <TextArea showCount rows={10} />
              </Form.Item>
            </Form>
            <div
              className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-center mb-4"
              onClick={() => {
                codeForm.submit();
              }}
              htmlType="submit"
            >
              Try Now!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
