function getMessages(input_data, count) {
  const params = {
    input_data: "print('hello world!')",
    count: 5
  };
  
  fetch(encodeURI(`http://127.0.0.1:8000/generate_chat/?input_data=${params.input_data}&count=${params.count}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(data => console.log("Response:", data))
    .catch(error => console.error("Error:", error))
}

getMessages()