import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";

import type {
  EmailFinderRequest,
  EmailFinderResponse,
  EmailFinderData,
} from "../../types/email-finder";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  // Handle Email Finder action
  if (actionType === "findEmail") {
    const name = formData.get("name") as string;
    const domain = formData.get("domain") as string;
    const timeout = formData.get("timeout") as string;

    if (!name || !domain) {
      return Response.json(
        {
          status: "error",
          error: {
            code: "VALIDATION_ERROR",
            message: "Name and domain are required fields",
          },
        },
        { status: 400 }
      );
    }

    const apiToken = process.env.CLEAROUT_API_TOKEN;

    if (!apiToken) {
      return Response.json(
        {
          status: "error",
          error: {
            code: "CONFIG_ERROR",
            message:
              "API token not configured. Please set CLEAROUT_API_TOKEN environment variable.",
          },
        },
        { status: 500 }
      );
    }

    const requestBody: EmailFinderRequest = {
      name,
      domain,
      timeout: timeout ? parseInt(timeout) : 30000,
      queue: true,
    };

    try {
      const response = await fetch(
        "https://api.clearout.io/v2/email_finder/instant",
        {
          method: "POST",
          headers: {
            Authorization: apiToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data: EmailFinderResponse = await response.json();

      if (!response.ok) {
        return Response.json(data, { status: response.status });
      }

      return Response.json(data);
    } catch (error) {
      return Response.json(
        {
          status: "error",
          error: {
            code: "NETWORK_ERROR",
            message:
              error instanceof Error
                ? error.message
                : "Failed to connect to Email Finder API",
          },
        },
        { status: 500 }
      );
    }
  }

  return Response.json({ status: "error", error: { code: "INVALID_ACTION", message: "Invalid action type" } });
};

export default function App() {
  const fetcher = useFetcher();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [timeout, setTimeout] = useState("30000");

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  const handleFindEmail = () => {
    const formData = new FormData();
    formData.append("actionType", "findEmail");
    formData.append("name", name);
    formData.append("domain", domain);
    formData.append("timeout", timeout);
    fetcher.submit(formData, { method: "POST" });
  };

  const renderResults = () => {
    if (!fetcher.data) return null;

    const data = fetcher.data as EmailFinderResponse;

    if (data.status === "error") {
      return (
        <div className={styles.results}>
          <div className={styles.error}>
            <h3>❌ Error</h3>
            <p>
              <strong>{data.error.code}</strong>: {data.error.message}
            </p>
          </div>
        </div>
      );
    }

    if (data.status === "success") {
      const resultData = data.data as EmailFinderData;
      return (
        <div className={styles.results}>
          <div className={styles.success}>
            <h3>✅ Results</h3>
            <p>
              Found {resultData.total} email(s) with {resultData.confidence_score}% confidence
            </p>
            <div className={styles.resultDetails}>
              <p><strong>Name:</strong> {resultData.full_name}</p>
              <p><strong>Company:</strong> {resultData.company.name}</p>
              <p><strong>Domain:</strong> {resultData.domain}</p>
              <p><strong>Found on:</strong> {new Date(resultData.found_on).toLocaleString()}</p>
            </div>
            <h4>Email Addresses:</h4>
            {resultData.emails.map((email, index) => (
              <div key={index} className={styles.emailResult}>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${email.email_address}`}>{email.email_address}</a>
                </p>
                <div className={styles.badges}>
                  <span className={styles.badge}>
                    {email.role === "yes" ? "Role Email" : "Personal Email"}
                  </span>
                  <span className={styles.badge}>
                    {email.business === "yes" ? "Business" : "Non-Business"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Email Finder - Discover Email Addresses</h1>
        <p className={styles.text}>
          Find verified email addresses instantly by providing a person's name and domain.
        </p>

        {/* Email Finder Form */}
        <div className={styles.form}>
          <h2>Find Email Address</h2>
          <label className={styles.label}>
            <span>Name</span>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Steven Morris"
            />
            <span>Enter the full name of the person</span>
          </label>

          <label className={styles.label}>
            <span>Domain or Company Name</span>
            <input
              className={styles.input}
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., apple.com"
            />
            <span>Enter the domain (e.g., apple.com) or company name</span>
          </label>

          <label className={styles.label}>
            <span>Timeout (milliseconds)</span>
            <input
              className={styles.input}
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
              placeholder="30000"
              min="10000"
              max="180000"
            />
            <span>Request wait time (min: 10000, max: 180000)</span>
          </label>

          <button
            className={styles.button}
            onClick={handleFindEmail}
            disabled={isLoading}
          >
            {isLoading ? "Finding Email..." : "Find Email"}
          </button>
        </div>

        {renderResults()}


      </div>
    </div>
  );
}
