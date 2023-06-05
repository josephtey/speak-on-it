export const constructingTranscript = (rawMessages) => {
  let transcript = [];
  console.log("messages: ", rawMessages);
  for (let i = 2; i < rawMessages.length; i++) {
    let message = rawMessages[i];

    transcript.push({
      content: message.content,
      role: message.role,
    });

    return transcript;
  }
};
