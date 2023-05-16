import react, { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router";
import { ChatOpenAI } from "langchain/chat_models";
import ReactLoading from "react-loading";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { updateDoc } from "firebase/firestore";
import {
  generateEssayEvaluationPrompt,
  generateEssayTranscriptPrompt,
} from "../prompts/essay";
import { sampleTranscript } from "../consts/transcripts";
import {
  generateCodeEvaluationPrompt,
  generateCodeTranscriptPrompt,
} from "../prompts/code";

const secretKey = process.env.REACT_APP_OPENAI_API_KEY;

function capitalizeWords(arr) {
  return arr.map((word) => {
    const firstLetter = word.charAt(0).toUpperCase();
    const rest = word.slice(1).toLowerCase();

    return firstLetter + rest;
  });
}

const rubric_categories = {
  code: [
    "critical_thinking",
    "code_understanding",
    "reflection",
    "problem_solving",
  ],
  essay: [
    "conceptual_understanding",
    "critical_thinking",
    "paper_understanding",
    "reflection",
  ],
};
const evaluateTranscript = async (transcript, name, type) => {
  const chat = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-4",
    openAIApiKey: secretKey,
  });

  const response = await chat.call([
    new SystemChatMessage(
      type === "essay"
        ? generateEssayEvaluationPrompt(name)
        : generateCodeEvaluationPrompt(name)
    ),
    new HumanChatMessage(
      type === "essay"
        ? generateEssayTranscriptPrompt(transcript, name)
        : generateCodeTranscriptPrompt(transcript, name)
    ),
  ]);

  return response.text;
};

const Evaluate = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [cleanedTranscript, setCleanedTranscript] = useState("");
  const [transcriptArr, setTranscriptArr] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const fetchTranscript = async () => {
      const docRef = doc(db, "assns", id);
      const docSnap = await getDoc(docRef);
      setData(docSnap.data());
      const c_transcript = docSnap.data().transcript.map((item) => {
        return {
          role: item.role === "assistant" ? "Liz" : "user" ? "Joe" : "",
          content: item.content,
        };
      });
      setTranscriptArr(c_transcript);
      let m_transcript = "";
      for (let i = 2; i < c_transcript.length; i++) {
        m_transcript += `${c_transcript[i].role}: ${c_transcript[i].content}\n`;
      }

      if (docSnap.data().evaluation) {
        setEvaluation(docSnap.data().evaluation);
      }
      setCleanedTranscript(m_transcript);
    };

    fetchTranscript();
  }, []);

  useEffect(() => {
    const evaluate = async () => {
      setIsEvaluating(true);
      const results = await evaluateTranscript(
        cleanedTranscript,
        data.name,
        data.type
      );
      const parsedResults = JSON.parse(results.replaceAll("\n", "").trim());
      const essaysRef = doc(db, "assns", id);

      await updateDoc(essaysRef, {
        evaluation: parsedResults,
      });

      setIsEvaluating(false);

      setEvaluation(parsedResults);
    };
    if (!data?.evaluation && data?.name && cleanedTranscript) {
      evaluate();
    }
  }, [cleanedTranscript, data]);

  return evaluation && transcriptArr ? (
    <div className="flex justify-center content-center w-full py-24 px-48">
      <div className="rounded-lg bg-white drop-shadow-md p-8 w-full">
        <div className="rounded-lg p-8 bg-gray-50 w-full flex flex-col gap-8 h-[800px] rounded-lg overflow-scroll">
          {transcriptArr.map((message, i) => {
            return i > 1 ? (
              <div
                className={`text-white ${
                  message.role !== "Liz"
                    ? "bg-blue-500 self-end"
                    : "bg-gray-500 self-start"
                } text-md w-2/3 p-3 rounded-lg`}
              >
                {message.content}
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  ) : isEvaluating ? (
    <div className="flex flex-row items-center justify-center w-full h-screen">
      <ReactLoading
        className="mr-2"
        type={"spin"}
        color={"black"}
        height={30}
        width={30}
      />{" "}
    </div>
  ) : null;
};

export default Evaluate;

// old
{
  /* <div className="w-9/12 justify-center content-center flex flex-col gap-8">
        <div className="text-2xl mb-16">
          <span className="text-3xl">
            <b>
              {evaluation.summary["overall_score"]}
              /12
            </b>{" "}
            <br />
            <br />
            <b className="text-2xl">Overall Score</b>
          </span>
          <br />
          <p className="pb-4">{evaluation.summary.reflection}</p>
        </div>

        {rubric_categories[data?.type].map((category) => {
          return (
            <div className="mb-8 text-xl">
              <b>{capitalizeWords(category.split("_")).join(" ")}:</b>{" "}
              {evaluation.rubric[category].score}/3
              <br />
              <p className="pb-4">{evaluation.rubric[category].reason}</p>
              <div className="my-4 text-gray-600">
                What did the student say?
              </div>
              <div className="flex flex-row gap-4">
                {evaluation.rubric[category].quotes.map((quote) => {
                  return (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-lg bg-gray-200 p-4 opacity-50 flex-1">
                        {quote.quote}
                      </div>
                      <div className="p-4 rounded-lg text-white bg-gray-800 p-4 flex-1">
                        {quote.reason}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div> */
}
