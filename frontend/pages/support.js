import Link from "next/link";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/NewEvent.module.css";
import { createTicket, supportReset } from "../features/support/supportSlice";
import ToastMessage, { showToastMessage } from "../components/ToastMessage";
import Spinner from "../components/Spinner";

const Support = () => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    tickets,
    supportError,
    supportSuccess,
    supportMessage,
    supportLoading,
  } = useSelector((store) => store.support);
  const { user, isLoading } = useSelector((store) => store.auth);

  // if not logged in, then redirect to login page
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login");
    }
  }, [user]);

  // if there is error or success, then show the appropriate message
  useEffect(() => {
    if (supportError && user) {
      showToastMessage(supportMessage, "error");
      dispatch(supportReset());
    }

    if (supportSuccess) {
      setTopic("");
      setCategory("");
      setEmail("");
      setSubject("");
      setDescription("");

      showToastMessage("Ticket created successfully", "success");
      dispatch(supportReset());

      setTimeout(() => {
        router.push("/my-tickets");
      }, 2000);
    }
  }, [supportError, supportSuccess]);

  // if user is not logged in or being fetched, then show the spinner
  // if (!user) {
  //   return <Spinner />;
  // }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      topic.trim() == "" ||
      category.trim() == "" ||
      subject.trim() == "" ||
      email.trim() == "" ||
      description.trim() == ""
    ) {
      return showToastMessage("All fields are required", "error");
    }

    dispatch(
      createTicket({
        subject: subject,
        email: email,
        category: category,
        topic: topic,
        description: description,
      })
    );
  };

  return (
    <Layout>
      <ToastMessage />
      <section className="loginForm_wrapper container">
        <div className={`loginForm_container ${styles.newEventFormContainer}`}>
          <h1>Help Desk</h1>
          <form onSubmit={handleSubmit}>
            <hr className="loginFormHr" style={{ marginBottom: "2rem" }} />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />

            <select
              className={styles.select}
              onChange={(e) => setCategory(e.target.value)}
              required
              value={category}
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="Event">Event</option>
              <option value="Team">Team</option>
              <option value="Integration">Integration Issue</option>
            </select>

            <input
              style={{ marginTop: "20px" }}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic"
              required
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              required
            />
            <input
              type="submit"
              className={`${styles.eventSubmitBtn}`}
              value={supportLoading ? "Loading..." : "Create Ticket"}
              disabled={supportLoading ? true : false}
            />
          </form>

          <ol>
            <span
              style={{
                display: "inline-block",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Note:
            </span>
            <li style={{ marginBottom: "0.3rem" }}>
              Our Support team's working hours are from 8am to 8pm, Mon-Sat.
            </li>
            <li style={{ marginBottom: "0.3rem" }}>
              You should expect to hear from our customer support team within 24
              hours.
            </li>
            <li style={{ marginBottom: "0.3rem" }}>
              For a detailed guide on how to connect with zoom,
              <Link href="/documentation">
                <a> click here.</a>
              </Link>
            </li>
          </ol>
        </div>
      </section>
    </Layout>
  );
};

export default Support;
