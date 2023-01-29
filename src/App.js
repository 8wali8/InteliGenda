import logo from './logo.svg';
import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';
import { useState } from 'react';
import React from 'react'
import ReactDOM from 'react-dom'

function App() {
  const [ start, setStart ] = useState(new Date());
  const [ end, setEnd ] = useState(new Date());
  const [ eventName, setEventName ] = useState("");
  const [ eventDescription, setEventDescription ] = useState("");

  const session = useSession(); // tokens, when session exists we have a user
  const supabase = useSupabaseClient(); // talk to supabase!
  const { isLoading } = useSessionContext();
  
  if(isLoading) {
    return <></>
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if(error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createCalendarEvent() {
    console.log("Creating calendar event");
    const event = {
      'summary': eventName,
      'description': eventDescription,
      'start': {
        'dateTime': start.toISOString(), // Date.toISOString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los_Angeles
      },
      'end': {
        'dateTime': end.toISOString(), // Date.toISOString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los_Angeles
      }
    }
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        'Authorization':'Bearer ' + session.provider_token // Access token for google
      },
      body: JSON.stringify(event)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      alert("Event created, check your Google Calendar!");
    });
  }

  console.log(session);
  console.log(start);
  console.log(eventName);
  console.log(eventDescription);
  return (
    <div className="App">
      <head>
        <title>IntelliGenda</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="style.css" />
      </head>
      <body className="w3-content, w3-display-right" style={{ maxWidth: "100%" }}>
          <h2>Intelligenda</h2>
            <p>Start of your event</p>
            <DateTimePicker onChange={setStart} value={start} />
            <p>End of your event</p>
            <DateTimePicker onChange={setEnd} value={end} />
            <p>Task Name</p>
            <input type="text" onChange={(e) => setEventName(e.target.value)} />
            <p>Task description</p>
            <input type="text" onChange={(e) => setEventDescription(e.target.value)} />
            <hr />
            <button onClick={() => createCalendarEvent()}>Update Calendar</button>
            <p></p>
            <button onClick={() => signOut()}>Sign Out</button>
          :
          <>
            <button onClick={() => googleSignIn()}>Sign In With Google</button>
          </>
        <div className="w3-row">
          <div className="w3-black w3-container w3-center" style={{ height: "100%" }}>
            <div className="w3-padding-64">
            </div>
            <div className="w3-padding-64">
              <form id="frm1" className="w3-padding-64 w3-display-left">
                Task Name:{" "}
                <input type="text" id="name" name="name" />
                <br />
                Time (hour):{" "}
                <input type="number" id="time" name="time" />
                <br />
                Difficulty (1-5):{" "}
                <input type="number" id="hard" name="hard" />
                <br />
                Due date:{" "}
                <input type="date" id="due-date" name="due-date" />
                <br />
              </form>
              <button onClick={addTask}>Add Task</button>
              <button onClick={sortTasks}>Sort Tasks</button>
              <p id="demo"></p>
            </div>
          </div>
        </div>
        
      </body>
    </div>
  );
}
let tasks = [];
function addTask() {
const taskName = document.getElementById("name").value;
const time = parseInt(document.getElementById("time").value);
const difficulty = parseInt(document.getElementById("hard").value);
const dueDate = new Date(document.getElementById("due-date").valueAsDate);
let today = new Date();
const diffTime = Math.abs(dueDate - today);
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
tasks.push([taskName, time, difficulty, dueDate, diffDays]);
document.getElementById("demo").innerHTML = "Task added to list";
document.getElementById("name").value = "";
document.getElementById("time").value = "";
document.getElementById("hard").value = "";
document.getElementById("due-date").value = "";
}
function sortTasks() {
tasks.forEach(task => {
task[4] = (task[1] * task[2]) / task[4];
});
tasks.sort((a, b) => {
return b[4] - a[4];
});
document.getElementById("demo").innerHTML = tasks.map(task => task[0]);
}

export default App;