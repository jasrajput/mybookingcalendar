import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/Support.module.css";
import Spinner from "../components/Spinner";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import {
  getTickets,
  supportReset,
  // deleteEvent,
} from "../features/support/supportSlice";
import ToastMessage, { showToastMessage } from "../components/ToastMessage";
import Link from "next/link";

const MyTickets = () => {
  const router = useRouter();

  const dispatch = useDispatch();
  const { tickets, supportError, supportSuccess, supportMessage } = useSelector(
    (store) => store.support
  );
  const { user, isLoading } = useSelector((store) => store.auth);

  // if there is some error in fetching the events, then show the toast message
  useEffect(() => {
    if (supportError && user) {
      showToastMessage(supportMessage, "error");
      setTimeout(() => {
        dispatch(supportReset());
      }, 2000);
    }
    // REVISION 1 *********************************************************
    if (supportSuccess) {
      dispatch(getTickets());
      showToastMessage(supportMessage, "success");
      dispatch(supportReset());
    }
    // REVISION 1 END *********************************************************
  }, [supportError, supportSuccess]);

  // fetch user events when the user is logged in
  useEffect(() => {
    if (user) {
      dispatch(getTickets());
    }
  }, [user]);

  // if user is not logged in, then redirect to login page
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login");
    }
  }, [user]);

  // if user is not yet fetched, then show the spinner component
  if (!user) {
    return <Spinner />;
  }

  // UPDATE 1 ********************************************************
  const handleEditBtn = (ticket) => {
    router.push(`/edit-ticket?id=${ticket._id}`);
  };
  // UPDATE 1 END ********************************************************

  return (
    <Layout>
      <ToastMessage />
      <section className={`container my-3`}>
        <main>
          <div className={`shadow rounded p-1 m-1`}>
            <TableContainer>
              <Table
                variant="striped"
                colorScheme="blue"
                size="lg"
                className={styles.table}
              >
                <Thead>
                  <Tr className={styles.th}>
                    <Th>Sr.no</Th>
                    <Th>Subject</Th>
                    <Th>Category</Th>
                    <Th>Topic</Th>
                    <Th>Status</Th>
                    <Th>Email</Th>
                    <Th>Last Updated</Th>
                    <Th>View</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tickets.length === 0 ? (
                    <Tr>
                      <Td>No tickets to show</Td>
                    </Tr>
                  ) : (
                    tickets.map((ticket, index) => (
                      <Tr key={index + 1} className={styles.td}>
                        <Td>{index + 1}</Td>
                        <Td>{ticket.subject}</Td>
                        <Td>{ticket.category}</Td>
                        <Td>{ticket.topic}</Td>
                        <Td
                          style={{
                            color: ticket.status == 0 ? "green" : "red",
                          }}
                        >
                          {ticket.status == 0 ? "Active" : "Closed"}
                        </Td>
                        <Td>{ticket.email}</Td>
                        <Td>{new Date(ticket.updatedAt).toDateString()}</Td>
                        <Td>
                          <svg
                            onClick={() => handleEditBtn(ticket)}
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#667172"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1 c-pointer feather feather-edit"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </div>
        </main>
      </section>
    </Layout>
  );
};

export default MyTickets;
