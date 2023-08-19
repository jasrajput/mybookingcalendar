import { useState, useEffect, useRef } from "react";
import {
  ChakraProvider,
  theme,
  Flex,
  Avatar,
  AvatarBadge,
  Text,
  Input,
  Button,
  Spacer,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import ToastMessage, { showToastMessage } from "../components/ToastMessage";
import styles from "../styles/NewTeam.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllMessages,
  singleMessageReset,
  sendMessage,
  messageReset,
} from "../features/chat/chatSlice";

import {
  getTicket,
  singleSupportReset,
} from "../features/support/supportSlice";
import Spinner from "../components/Spinner";

const Footer = ({ inputMessage, setInputMessage, handleSendMessage }) => {
  return (
    <Flex w="100%" mt="5">
      <Input
        placeholder="Send your reply"
        border="none"
        borderRadius="none"
        _focus={{
          border: "1px solid black",
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleSendMessage();
          }
        }}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
      />
      <Button
        bg="black"
        color="white"
        borderRadius="none"
        _hover={{
          bg: "white",
          color: "black",
          border: "1px solid black",
        }}
        disabled={inputMessage.trim().length <= 0}
        onClick={handleSendMessage}
      >
        Send
      </Button>
    </Flex>
  );
};

const Messages = ({ messages }) => {
  const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  return (
    <Flex w="100%" h="80%" overflowY="scroll" flexDirection="column" p="3">
      {messages.map((item, index) => {
        if (item.from === "me") {
          return (
            <Flex key={index} w="100%" justify="flex-end">
              <Flex
                bg="black"
                color="white"
                minW="100px"
                maxW="350px"
                my="1"
                p="3"
              >
                <Text>{item.message}</Text>
              </Flex>
            </Flex>
          );
        } else {
          return (
            <Flex key={index} w="100%">
              <Avatar
                name="Computer"
                src="https://avataaars.io/?avatarStyle=Circle&topType=ShortHairTheCaesar&accessoriesType=Blank&hairColor=Brown&facialHairType=BeardLight&facialHairColor=Brown&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"
                bg="blue.300"
              ></Avatar>
              <Flex
                bg="gray.100"
                color="black"
                minW="100px"
                maxW="350px"
                my="1"
                p="3"
              >
                <Text>{item.message}</Text>
              </Flex>
            </Flex>
          );
        }
      })}
      <AlwaysScrollToBottom />
    </Flex>
  );
};

const EditTicket = () => {
  const [messagesShow, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();

  const {
    messages,
    messageError,
    messageSuccess,
    messageMessage,
    messageLoading,
  } = useSelector((store) => store.chat);

  const {
    ticket,
    supportLoading,
    supportSuccess,
    supportError,
    supportMessage,
  } = useSelector((store) => store.support);
  const { user, isLoading } = useSelector((store) => store.auth);

  const handleSendMessage = () => {
    if (!inputMessage.trim().length) {
      return;
    }

    const data = inputMessage;

    dispatch(
      sendMessage({
        message: data,
        replyBy: 0,
        supportID: router.query.id,
      })
    );

    setMessages((old) => [{ from: "me", message: data }]);
    // dispatch(messageReset());
    // dispatch(singleMessageReset());
    // dispatch(getAllMessages(router.query.id));
    setInputMessage("");

    setTimeout(() => {
      setMessages((old) => [
        ...old,
        { from: "computer", message: "We will reply soon" },
      ]);
    }, 1000);
  };

  // fetch the data after loading the component
  useEffect(() => {
    if (router.query.id && user) {
      dispatch(getAllMessages(router.query.id));
      dispatch(getTicket(router.query.id));
    }
  }, [router.query.id, user]);

  // if there is error or success, then show the appropriate message
  useEffect(() => {
    if (messageError && user) {
      showToastMessage(messageMessage, "error");
      dispatch(singleMessageReset());
      dispatch(messageReset());
    }

    if (messageSuccess) {
      if (messages) {
        messages.filter((message) => {
          let from;
          let singleMessage = message.message;
          if (message.replyBy == 0) {
            from = "me";
          } else {
            from = "computer";
          }

          setMessages((old) => [
            ...old,
            { id: message.id, from: from, message: singleMessage },
          ]);
        });
      }
    }

    if (supportError && user) {
      showToastMessage(supportMessage, "error");
      dispatch(singleSupportReset());
    }

    if (ticket) {
      if (Object.keys(ticket).length == 0) {
        router.push("/my-tickets");
      } else {
        let dateStr = ticket.updatedAt;
        let da = new Date(dateStr);
        setUpdatedAt(da.toDateString());

        let actualStatus;
        if (ticket.status == 0) {
          actualStatus = "Active";
        } else if (ticket.status == 1) {
          actualStatus = "Resolved";
        } else {
          actualStatus = "Closed";
        }

        setTicketStatus(actualStatus);
      }

      dispatch(messageReset());
    }
  }, [messageError, messageSuccess, supportSuccess, supportError]);

  // redirect to login page if the user is not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login?from=edit-ticket");
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (messageError && user && messageMessage) {
      showToastMessage(messageMessage, "error");
      dispatch(singleMessageReset());
      dispatch(messageReset());
    } else if (messageSuccess && user && messageMessage) {
      showToastMessage(messageMessage, "success");
      // set all the fields to empty

      dispatch(singleMessageReset());
      dispatch(messageReset());
    }
  }, [messageError, messageSuccess, messageMessage]);

  useEffect(() => {
    if (supportError && user && supportMessage) {
      showToastMessage(supportMessage, "error");
      dispatch(singleSupportReset());
    } else if (supportSuccess && user && supportMessage) {
      showToastMessage(supportMessage, "success");
      dispatch(singleSupportReset());
    }
  }, [supportError, supportSuccess, supportMessage]);

  // show the loading screen when data is being fetched
  if (supportLoading || messageLoading || isLoading || !user) {
    return <Spinner />;
  }

  return (
    <Layout>
      <ToastMessage />
      <ChakraProvider>
        <Flex w="100%" h="100vh" justify="center" align="center">
          <Flex w={["90%", "90%", "60%"]} h="90%" flexDir="column">
            <Flex w="100%">
              <Avatar size="lg" name={user.name}>
                <AvatarBadge boxSize="1.25em" bg="green.500" />
              </Avatar>
              <Flex flexDirection="column" mx="5" justify="center">
                <Text fontSize="lg" fontWeight="bold">
                  {user.name}
                </Text>
                <Text color="green.500">Last updated - {updatedAt}</Text>
              </Flex>
              <Spacer />

              <Flex
                flexDirection="column"
                mx="5"
                justify="center"
                align="center"
              >
                <Text color="white.500">Ticket Status </Text>
                <Text
                  color={ticketStatus == "Active" ? "green.500" : "red.500"}
                >
                  {ticketStatus}
                </Text>
              </Flex>
            </Flex>

            <svg height="1" style={{ marginTop: 20 }}>
              <line
                x1="0"
                y1="0"
                x2="100%"
                y2="0"
                stroke="black"
                strokeWidth="1"
              />
            </svg>

            <Messages messages={messagesShow} />

            {ticketStatus == "Active" && (
              <Footer
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSendMessage={handleSendMessage}
              />
            )}
          </Flex>
        </Flex>
      </ChakraProvider>
    </Layout>
  );
};

export default EditTicket;
