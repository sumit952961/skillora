async function runTest() {
  const API = 'http://localhost:5000/api';
  console.log("=== STARTING CONTEST FLOW TEST ===");

  try {
    // 1. Get active contests
    console.log("1. Fetching active contests...");
    const contestsRes = await fetch(`${API}/contests/active`);
    const contestsData = await contestsRes.json();
    console.log("Active Contests:", contestsData.length);
    
    let contestId;
    if (contestsData.length === 0) {
      console.log("No active contest found. Please create an active contest in the admin panel first to test.");
      return;
    } else {
      contestId = contestsData[0]._id;
      console.log(`Using Contest ID: ${contestId} (${contestsData[0].title})`);
    }

    // 2. Register dummy student
    const dummyUserId = "60c72b2f9b1d8b001c8e4d2a";
    console.log("2. Registering dummy student...");
    const regRes = await fetch(`${API}/contests/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: dummyUserId,
        contestId: contestId,
        studentName: "Test Student",
        studentEmail: "teststudent@example.com",
        mobileNumber: "9999999999",
        course: "B.Tech",
        branch: "CSE",
        semester: "6",
        college: "Test Institute",
        domain: contestsData[0].domains[0]
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) {
      if (regRes.status === 400 && regData.message.includes("already registered")) {
        console.log("Student already registered. Continuing...");
      } else {
        throw new Error(regData.message);
      }
    } else {
      console.log("Registration Response:", regData.message);
    }

    // 3. Fetch Arena Questions
    console.log("3. Fetching Arena Questions...");
    const arenaRes = await fetch(`${API}/contests/arena/${contestId}/${dummyUserId}`);
    const arenaData = await arenaRes.json();
    if (!arenaRes.ok) throw new Error(arenaData.message);
    console.log(`Received ${arenaData.questions.length} questions.`);
    if (arenaData.questions.length === 0) {
      console.log("No questions found for this domain. Test cannot proceed.");
      return;
    }

    // 4. Submit Test
    console.log("4. Submitting test...");
    const answers = {};
    arenaData.questions.forEach(q => { answers[q._id] = 0; });

    const submitRes = await fetch(`${API}/contests/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: dummyUserId,
        contestId: contestId,
        answers: answers,
        timeTaken: 120
      })
    });
    const submitData = await submitRes.json();
    if (!submitRes.ok) {
      if (submitRes.status === 400 && submitData.message.includes("already submitted")) {
        console.log("Test already submitted.");
      } else {
        throw new Error(submitData.message);
      }
    } else {
      console.log(`Test Submitted! Score: ${submitData.score}`);
    }

    // 5. Fetch Leaderboard
    console.log("5. Fetching Leaderboard...");
    const lbRes = await fetch(`${API}/contests/leaderboard/${contestId}`);
    const lbData = await lbRes.json();
    console.log("Leaderboard Data:");
    lbData.forEach(lb => {
      console.log(`Rank ${lb.rank} | ${lb.name} | ${lb.score} | Real: ${lb.isReal}`);
    });

    console.log("=== TEST COMPLETED SUCCESSFULLY ===");

  } catch (error) {
    console.error("Test Failed!", error.message);
  }
}

runTest();
