import React, {useEffect, useState} from 'react';
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";

const Dashboard = () => {
const [data, setData] = useState(null)
  useEffect(()=>{
    const fetchDocs = async () => {
      const timestamp = 1689073318612
      const querySnapshot = await getDocs(query(collection(db, "assns"), where("time", ">=", timestamp)));
    
      const all = []
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        all.push(docData)
      });

      setData(all)
    }

    fetchDocs();
    
  }, [])

  return data && (
    <div className="p-36">
        <div className="text-4xl font-bold">Beta Stats</div><br/>
        <b>Num uses: </b> {data.length} <br/>
        <b>Unique users:</b> {[...new Set(data.map(item => item.email))].length} <br/>
        <b>Reading Responses: </b> {data.filter(item => item.task_type === "Reading Responses").length} <br />
        <b>Student-Based Assignments: </b> {data.filter(item => item.task_type === "Student-Based Assignment").length} <br />
        <br/>
        <b>What was your general feeling?</b>
        <div>
        {data.map(item => {
            if (item.feedback?.feeling) {
                return (<p>• {item.feedback.feeling} <i>{item.email}</i></p>)
            } else {
                return null
            }
        })}
        </div>
        <br/>

        <br/>
        <b>Do you prefer having control over the questions?</b>
        <div>
        {data.map(item => {
            if (item.feedback?.control) {
                return (<p>• {item.feedback.control} <i>{item.email}</i></p>)
            } else {
                return null
            }
        })}
        </div>
        <br/>

        <br/>
        <b>Could you differentiate between a good and bad answer?</b>
        <div>
        {data.map(item => {
            if (item.feedback?.distinguish) {
                return (<p>• {item.feedback.distinguish} <i>{item.email}</i></p>)
            } else {
                return null
            }
        })}
        </div>
        <br/>

        <br/>
        <b>Do you feel like Liz was an extension of YOU?</b>
        <div>
        {data.map(item => {
            if (item.feedback?.extension) {
                return (<p>• {item.feedback.extension} <i>{item.email}</i></p>)
            } else {
                return null
            }
        })}
        </div>
        <br/>

        <br/>
        <b className="text-xl">Questions</b>
            <div>
                {data.map(item => {
                if (item.question_1 && item.question_2 && item.question_3 && item.task_type === "Student-Based Assignment") {
                    return (
                    <div className="mb-4">
                        <b>{item.task_type}</b><br/>
                        <b>{item.task_prompt}</b><br/>
                        <b>{item.subject}</b><br/>
                        <p>• {item.question_1}</p>
                        <p>• {item.question_2}</p>
                        <p>• {item.question_3}</p><br/>
                        <i>{item.email}</i>
                    </div>)
                } else {
                    return null
                }
            })}
            </div>
        <br/>

    </div>
  );
}

export default Dashboard;
