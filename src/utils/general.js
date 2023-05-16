export const constructingTranscript = (rawMessages) => {
  let transcript = [];
  for (let i = 2; i < rawMessages.length; i++) {
    let details = {};
    let message = rawMessages[i];
    let content = message;

    try {
      details = JSON.parse(
        message.content.split("@")[0].replaceAll("\n", "").trim()
      );
    } catch (e) {
      console.error(e);
    }

    try {
      content = message.content.split("@")[1];
    } catch (e) {
      console.error(e);
    }

    transcript.push({
      content: content,
      details: details,
    });
  }

  return transcript;
};
