import react, { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router";
import { ChatOpenAI } from "langchain/chat_models";
import ReactLoading from "react-loading";
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
} from "langchain/schema";
import { updateDoc, collection } from "firebase/firestore";

const secretKey = process.env.REACT_APP_OPENAI_API_KEY;

const sampleTranscript = `
Liz: Hello Shaurya, thank you for sharing your essay with me. It's great to see that you've put in considerable effort to explore the theory of multiple realizability and its implications for the mind-body problem. Remember, this conversation is a low-stakes environment for reflecting on your understanding of the essay, and you don't have to know every single answer. Let's get started!

To begin with, let's talk a little about your experience writing this essay. How did you find the process of researching and writing about the mind-body problem and the theory of multiple realizability? Did you come across any challenges or surprises during your research?

Shaurya: I think the challenges I faced while writing this essay how to do primarily with choosing the right theory for the solution to the mind-body problem. I think there’s so many theories out there, and figuring out which one resonated the most with me was quite challenging. I think the other thing I found that was pretty challenging was trying to pick out two counter arguments to the theory of multiple realizeability because I do feel like it’s a fairly robust theory, but I think I ended up overcoming it by trying to acknowledge the fact that these theories are robust and just respond to them with as thoughtful of an answer as opposed to necessarily defending the arguments with counter arguments 

I just feel like the theory of multiple realizability is so much more flexible as opposed to any of the other theories, it is more nuanced in its ability to get granular with the relationship between one state in other states, and I also think it’s reconciliatory in nature because it enables individuals with different perspectives to have a conversation as opposed to the more constrained approaches in eliminativism.

Liz: It's great to hear that you carefully considered different theories before choosing multiple realizability for your essay. It's also interesting how you appreciate its flexibility and reconciliatory nature, which can indeed foster productive conversations among individuals with different perspectives.

In your essay, you mentioned Hilary Putnam's arguments for multiple realizability as an anti-reductionist solution to the mind-body problem. Can you explain a bit more about Putnam's anti-reductionist stance and how it contributes to the appeal of multiple realizability as a solution to the mind-body problem?

Shaurya: I honestly don't know Putnam's arguments that well, can we discuss Nagel instead?

Liz: Of course, we can discuss Thomas Nagel's work instead. Although Nagel is not directly arguing for multiple realizability, his ideas can be seen as relevant to the broader discussion of the mind-body problem.

In his paper, "What is it like to be a bat?", Nagel presents a challenge to reductionist approaches to consciousness. He argues that there is an inherently subjective aspect to conscious experiences, which he refers to as "qualia." This subjective aspect cannot be captured by objective, physical explanations alone. 

How do you see Nagel's arguments relating to the theory of multiple realizability, especially in terms of capturing the subjective aspect of conscious experiences?

Shaurya: That’s honestly a really interesting question. I think if we were going to do future research into the role of Qualia in our lives, it would be helpful to have some operationalization of what Qualia really means. I think right now research doesn’t have a tangible and reliable framework to look at a lot of the subject of experiences just because of how much individual differentiation that is between one persons, individual and another. I think it would be interesting if we were able to build large data sets when we could actually see what’s objective for dominant look like for different people and then begin to understand if there are any deeper undercurrents that cut across all forms of qualia in all individuals 

Yes I can I think in my paper I mention this individual call Thomas Nagel, who wrote what is it like to be a bat in his essay although he is an individual who believes in physicalism that is the non-productive approach he has to physicalism that is really interesting and I think that, although Thomas doesn’t really argue for multiple realizability, the actual philosophical position of multiple realizability enables him to enter space is where he can make those conversations happen, because all the theories are way more constrained and wouldn’t really allowed for a new wants to take like his exist in the subspace of philosophical dialogue on the true nature of consciousness.

Liz: It's clear that you've thought deeply about how the theory of multiple realizability can create a space for nuanced discussions like Nagel's non-reductive physicalism. This reconciliatory aspect of multiple realizability indeed allows for a broader range of perspectives to be included in the conversation on the nature of consciousness.

Regarding your idea about future research into qualia, it's intriguing to consider how building large datasets and exploring objective commonalities across subjective experiences could potentially help us better understand qualia.

Now, let's discuss a bit about the counter-arguments you mentioned in your essay, specifically the one related to qualia. You acknowledged that multiple realizability might not fully account for qualia and certain mental states. Can you think of any potential ways in which the theory of multiple realizability could be adapted or supplemented to better address this concern?

Shaurya: I just feel like Qualia is one of the most integral parts of the human experience, and I think that ignoring subjective and interpretive parts of being an individual existing in this world means that your theory of consciousness is going to inherently, be limited, and its ability to fully appreciate the detailed and complex relationship between the mind and body 

I think this is inherent limitation of the theory of multiple realizability, because when you try to create multiple states, you are Innoway trying to create multiple equivalence relations between a mental and physical state and in doing so there will always be this uncertainty of when will be sorry I’d like to rephrase that there will always be in inherent uncertainty in when there is a cap on the number of states you could possibly have, and it’s just theoretically impossible to know where that cap would be in a frame of reference, where are there are multiple states 

Liz: You raise valid concerns about the limitations of multiple realizability in accounting for qualia and the complexity of the mind-body relationship. It's important to recognize that no theory can perfectly capture every aspect of consciousness, especially given our current understanding.

One possible way to address this concern is by integrating multiple realizability with other theories or approaches that focus more directly on subjective experiences. For example, combining the insights from multiple realizability with research on the neural correlates of consciousness could potentially help us better understand the relationship between physical states and subjective experiences. Additionally, interdisciplinary approaches, such as incorporating insights from psychology, cognitive science, and neuroscience, may provide a more comprehensive understanding of the mind-body problem and the role of qualia.

Overall, it's essential to acknowledge the limitations of any theory and remain open to integrating new ideas and perspectives to better understand the complex and nuanced nature of consciousness.

Thank you for engaging in this thoughtful discussion about your essay, Shaurya. I appreciate your willingness to reflect on your understanding and explore different aspects of the mind-body problem and multiple realizability. Keep up the good work and continue to engage in meaningful conversations like this one!

`;
const generateEvaluationPrompt = (name) => {
  return `You are an AI teaching assistant called Liz. Your goal is to receive a transcript between an AI oral conversational agent, Liz, and a student, ${name}. Your goal is to evaluate the ${name} answer according to the following formative assessment rubric. 

  Formative Assessment Rubric for Essay Evaluation
  
  "Performance Level: 1 (Low) - 2 (Medium) - 3 (High) 
  
  Critical Thinking
  Low: Arguments are weak, unsupported, and lack critical discussion to address counter-arguments.
  Medium: Arguments are somewhat supported and there is some critical discussion to address counter-arguments.
  High: Arguments are strong, well-supported, and thoroughly address counter-arguments through critical discussion.      
  
  Conceptual Understanding 
  Low: Ideas mentioned are not well-understood, and explanations of choices are unclear.          
  Medium: Ideas mentioned are generally understood, but explanations of choices may lack depth.     
  High: Ideas mentioned are well-understood, and the student can clearly explain their choice of figures, phrases, or arguments. 
  
  Reflection  
  Low: Little to no reflection on the essay writing process.
  Medium: Some reflection on the essay writing process, but it may be superficial or lack insight.                 
  High: Thoughtful reflection on the essay writing process, demonstrating self-awareness, growth, and learning.             
  
  Paper Understanding
  Low: Difficulty understanding the structure and organization of their own essay.  
  Medium: Moderate understanding of the structure and organization of their own essay.                             
  High: Clear understanding of the structure and organization of their own essay, with a logical flow of arguments.         
  
  Scoring Guide:
  Total Points: ___ / 12
  
  9-12 Points: The student demonstrates a high level of understanding, critical thinking, reflection, and organization in their essay. They have a solid grasp of the concepts presented and can clearly express their ideas, as well as engage in meaningful self-reflection on their writing process.
  
  5-8 Points: The student demonstrates a moderate level of understanding, critical thinking, reflection, and organization in their essay. Some areas may require improvement, such as strengthening arguments, deepening conceptual understanding, or providing more insightful reflection on the writing process. Overall, the student shows potential for growth and development in their essay writing skills.
  
  1-4 Points: The student demonstrates a low level of understanding, critical thinking, reflection, and organization in their essay. Significant improvement is needed in multiple areas, such as constructing stronger arguments, developing a deeper understanding of concepts, and engaging in more meaningful self-reflection on the writing process. Additional support and guidance may be beneficial for the student to enhance their essay writing skills."
  
  You should output a dictionary with the following arrays. 
  
  Summary Array: In the summary section, you should output the overall score the student received, followed by a 18 sentence reflection to the teacher regarding the student's overall performance. Divide the reflection according to a 2-3 sentence takeaway per rubric category.
  
  Rubric Array: In the rubric section, grade the student per rubric category, and write 6 sentences regarding their performance in the category. Then, extract 3 quotes by the student per rubric category. In the end, write a 4 sentence takeaway on why you chose these quotes, and how they relate to the rubric category. 
  
  Here is the format: 
  
  {
    "summary": {
      "overall_score": <overall_score>,
      "reflection": "<reflection>"
    },
    "rubric": {
      "critical_thinking": {
        "score": <score>,
        "reason": <takeaway>, 
        "quotes": [<quote 1>, <quote 2>, <quote 3>],
        "quote_reasons": [<quote reason 1>, <quote reason 2>, <quote reason 3>]
      },
      "conceptual_understanding": {
        "score": <score>,
        "reason": <takeaway>, 
        "quotes": [<quote 1>, <quote 2>, <quote 3>],
        "quote_reasons": [<quote reason 1>, <quote reason 2>, <quote reason 3>]
      },
      "reflection": {
        "score": <score>,
        "reason": <takeaway>, 
        "quotes": [<quote 1>, <quote 2>, <quote 3>],
        "quote_reasons": [<quote reason 1>, <quote reason 2>, <quote reason 3>]
      },
      "paper_understanding": {
        "score": <score>,
        "reason": <takeaway>, 
        "quotes": [<quote 1>, <quote 2>, <quote 3>],
        "quote_reasons": [<quote reason 1>, <quote reason 2>, <quote reason 3>]
      }
    }
  }
  `;
};

const generateTranscriptPrompt = (transcript, name) => {
  return `
    Hi. Here is the transcript of the interaction between Liz and ${name}: 

    ${transcript}
  `;
};

const evaluateTranscript = async (transcript, name) => {
  const chat = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-4",
    openAIApiKey: secretKey,
  });

  const response = await chat.call([
    new SystemChatMessage(generateEvaluationPrompt()),
    new HumanChatMessage(generateTranscriptPrompt(transcript, name)),
  ]);

  return response.text;
};

const Evaluate = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [cleanedTranscript, setCleanedTranscript] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "essays", id);
      const docSnap = await getDoc(docRef);
      setData(docSnap.data());
      const c_transcript = docSnap.data().transcript.map((item) => {
        return {
          role: item.role === "assistant" ? "Liz" : "user" ? "Joe" : "",
          content: item.content,
        };
      });

      let m_transcript = "";
      for (let i = 2; i < c_transcript.length; i++) {
        m_transcript += `${c_transcript[i].role}: ${c_transcript[i].content}\n`;
      }
      console.log(m_transcript);

      if (docSnap.data().evaluation) {
        setEvaluation(docSnap.data().evaluation);
      }
      setCleanedTranscript(m_transcript);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const evaluate = async () => {
      setIsEvaluating(true);
      const results = await evaluateTranscript(cleanedTranscript, data.name);
      const parsedResults = JSON.parse(results.replaceAll("\n", "").trim());
      const essaysRef = doc(db, "essays", id);

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

  return evaluation ? (
    <div className="flex justify-center content-center w-full py-24">
      <div className="w-9/12 justify-center content-center font-serif flex flex-col gap-8">
        <div className="text-2xl mb-16">
          <span className="text-3xl">
            <b>
              {evaluation.rubric["conceptual_understanding"].score +
                evaluation.rubric["critical_thinking"].score +
                evaluation.rubric["paper_understanding"].score +
                evaluation.rubric["reflection"].score}
              /12
            </b>{" "}
            <br />
            <br />
            <b className="text-2xl">Overall Score</b>
          </span>
          <br />
          <p className="pb-4">{evaluation.summary.reflection}</p>
        </div>

        <div className="mb-8 text-xl">
          <b>Conceptual Understanding: </b>{" "}
          {evaluation.rubric["conceptual_understanding"].score}/3
          <br />
          <p className="pb-4">
            {evaluation.rubric["conceptual_understanding"].reason}
          </p>
          <div className="my-4 text-gray-600">What did the student say?</div>
          <div className="flex flex-row gap-4">
            {evaluation.rubric["conceptual_understanding"].quotes.map(
              (quote, i) => {
                return (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-lg bg-gray-200 p-4 opacity-50 flex-1">
                      {quote}
                    </div>
                    <div className="p-4 rounded-lg text-white bg-gray-800 p-4 flex-1">
                      {
                        evaluation.rubric["conceptual_understanding"]
                          .quote_reasons[i]
                      }
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="mb-8 text-xl">
          <b>Critical Thinking: </b>{" "}
          {evaluation.rubric["critical_thinking"].score}/3
          <br />
          <p className="pb-4">
            {evaluation.rubric["critical_thinking"].reason}
          </p>
          <div className="my-4 text-gray-600">What did the student say?</div>
          <div className="flex flex-row gap-4">
            {evaluation.rubric["critical_thinking"].quotes.map((quote, i) => {
              return (
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg bg-gray-200 p-4 opacity-50 flex-1">
                    {quote}
                  </div>
                  <div className="p-4 rounded-lg text-white bg-gray-800 p-4 flex-1">
                    {evaluation.rubric["critical_thinking"].quote_reasons[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-8 text-xl">
          <b>Paper Understanding: </b>{" "}
          {evaluation.rubric["paper_understanding"].score}/3
          <br />
          <p className="pb-4">
            {evaluation.rubric["paper_understanding"].reason}
          </p>
          <div className="my-4 text-gray-600">What did the student say?</div>
          <div className="flex flex-row gap-4">
            {evaluation.rubric["paper_understanding"].quotes.map((quote, i) => {
              return (
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg bg-gray-200 p-4 opacity-50 flex-1">
                    {quote}
                  </div>
                  <div className="p-4 rounded-lg text-white bg-gray-800 p-4 flex-1">
                    {evaluation.rubric["paper_understanding"].quote_reasons[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-8 text-xl">
          <b>Reflection: </b> {evaluation.rubric["reflection"].score}/3
          <br />
          <p className="pb-4">{evaluation.rubric["reflection"].reason}</p>
          <div className="my-4 text-gray-600">What did the student say?</div>
          <div className="flex flex-row gap-4">
            {evaluation.rubric["reflection"].quotes.map((quote, i) => {
              return (
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg bg-gray-200 p-4 opacity-50 flex-1">
                    {quote}
                  </div>
                  <div className="p-4 rounded-lg text-white bg-gray-800 p-4 flex-1">
                    {evaluation.rubric["reflection"].quote_reasons[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  ) : isEvaluating ? (
    <div className="flex flex-row items-center">
      <ReactLoading
        className="mr-2"
        type={"spin"}
        color={"black"}
        height={15}
        width={15}
      />{" "}
    </div>
  ) : null;
};

export default Evaluate;
