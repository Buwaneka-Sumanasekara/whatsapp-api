const axios = require("axios").default;

const MESSAGE_TYPE = {
  TEXT: "text",
  INTERACTIVE: "interactive",
};
const KEYWORD = "HELLO";

const phoneNumber = "119940174385529";
const URL = `https://graph.facebook.com/v16.0/119940174385529/messages`;
const token =process.env.WHATSAPP_TOKEN
const office = "BANGLADESH  DHAKA";

const questions = [
  {
    question: "Please advice on stability on Air Freight Rate Changes",
    answers: [
      { id: 1, title: "No Change" },
      { id: 2, title: "Rates Increased" },
      { id: 3, title: "Rates Decreased" },
    ],
  },
];

const messageType = "list";

function processResponseMessage(value) {
  const contacts = value.contacts;
  const messageCount = value.messages.length || 0;

  if (messageCount > 0) {
    const lastMessage = value.messages[messageCount - 1];
    const contact = contacts.find((v) => v.wa_id === lastMessage.from);
    if (lastMessage.type === MESSAGE_TYPE.TEXT) {
      const txt = lastMessage.text.body || "";
      if (KEYWORD === txt.toUpperCase()) {
        handleGreetingMessage(contact);

        setTimeout(() => sendQuestion(contact, 0), 200);
      } else {
        console.error("unsupported keyword:", txt);
      }
    } else if (lastMessage.type === MESSAGE_TYPE.INTERACTIVE) {
      handleInteractiveMessageResp(contact, lastMessage);
    } else {
      throw Error("Un supported message type");
    }
  } else {
    throw Error("No messages found");
  }
}

const reqHeader = {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
};

function sendQuestion(contact, questionIndex = 0) {
  console.log("send initial question to:", contact.wa_id);

  const userName = contact.profile.name;
  const questionObj = questions[questionIndex];

  const buttons = questionObj.answers.map((a) => ({
    type: "reply",
    reply: a,
  }));

  const reqBody = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: contact.wa_id,
    type: MESSAGE_TYPE.INTERACTIVE,
    interactive: {
      header: {
        type: "text",
        text: office,
      },
      type: messageType,
      body: {
        text: questionObj.question,
      },
      action: {
        button: "Click to response",
        sections: [
          {
            rows: questionObj.answers,
          },
        ],
      },
    },
  };

  axios
    .post(URL, reqBody, reqHeader)
    .then((response) => {
      const res = response.data;

      const messagesCount = res.messages.length || 0;

      if (messagesCount > 0) {
        console.log("send message Id:", res.messages[messagesCount - 1].id);
      }
    })
    .catch((error) => {
      console.log("error---", error.response.data);
    });
}

function handleGreetingMessage(contact) {
  const userName = contact.profile.name;
  const reqBody = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: contact.wa_id,
    type: "text",
    text: {
      preview_url: false,
      body: `Hello ${userName},`,
    },
  };

  axios
    .post(URL, reqBody, reqHeader)
    .then((response) => {
      //console.log(response.data);
    })
    .catch((error) => {
      console.log("error---", error.response.data);
    });
}

function handleInteractiveMessageResp(contact, message) {
  const messageId = message.context.id;

  const response = message.interactive.list_reply;

  console.log(
    "response received for messageId :",
    messageId,
    "   resp:",
    JSON.stringify(response)
  );

  const reqBody = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: contact.wa_id,
    type: "text",
    text: {
      preview_url: false,
      body: `Thank you for your response. We will record the response as : ${response.title}`,
    },
  };

  axios
    .post(URL, reqBody, reqHeader)
    .then((response) => {
      //console.log(response.data);
    })
    .catch((error) => {
      console.log("error---", error.response.data);
    });
}

module.exports = { processResponseMessage };
