import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";

import type {
  EmailFinderRequest,
  EmailFinderResponse,
  EmailFinderData,
} from "../../types/email-finder";

import { Input, Button } from "../../components/ui";
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
    if (!fetcher.data) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📧</div>
          <h3>No Results Yet</h3>
          <p>Enter a name and domain to find email addresses</p>
        </div>
      );
    }

    const data = fetcher.data as EmailFinderResponse;

    if (data.status === "error") {
      return (
        <div className={styles.resultsContent}>
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>❌</div>
            <h3>Error</h3>
            <div className={styles.errorDetails}>
              <p className={styles.errorCode}>{data.error.code}</p>
              <p className={styles.errorMessage}>{data.error.message}</p>
            </div>
          </div>
        </div>
      );
    }

    if (data.status === "success") {
      const resultData = data.data as EmailFinderData;
      return (
        <div className={styles.resultsContent}>
          <div className={styles.successCard}>
            <div className={styles.successHeader}>
              <div className={styles.successIcon}>✅</div>
              <div>
                <h3>Email Found</h3>
                <p className={styles.confidence}>
                  {resultData.total} email(s) with {resultData.confidence_score}% confidence
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h4>Details</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Name</span>
                  <span className={styles.infoValue}>{resultData.full_name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Company</span>
                  <span className={styles.infoValue}>{resultData.company.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Domain</span>
                  <span className={styles.infoValue}>{resultData.domain}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Found on</span>
                  <span className={styles.infoValue}>
                    {new Date(resultData.found_on).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.emailsSection}>
              <h4>Email Addresses</h4>
              {resultData.emails.map((email, index) => (
                <div key={index} className={styles.emailCard}>
                  <div className={styles.emailAddress}>
                    <a href={`mailto:${email.email_address}`}>{email.email_address}</a>
                  </div>
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
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.index}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Email Finder</h1>
          <p className={styles.subtitle}>
            Discover verified email addresses instantly
          </p>
        </div>

        <div className={styles.mainContent}>
          {/* Left Column - Form */}
          <div className={styles.formSection}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Find Email Address</h2>
              <div className={styles.formInputs}>
                <Input
                  id="name"
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Steven Morris"
                  helperText="Enter the full name of the person"
                />

                <Input
                  id="domain"
                  label="Domain or Company Name"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g., apple.com"
                  helperText="Enter the domain (e.g., apple.com) or company name"
                />

                <Input
                  id="timeout"
                  label="Timeout (milliseconds)"
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(e.target.value)}
                  placeholder="30000"
                  min="10000"
                  max="180000"
                  helperText="Request wait time (min: 10000, max: 180000)"
                />

                <Button
                  onClick={handleFindEmail}
                  disabled={isLoading || !name || !domain}
                  isLoading={isLoading}
                  fullWidth
                  size="large"
                >
                  {isLoading ? "Finding Email..." : "Find Email"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className={styles.resultsSection}>
            {renderResults()}
          </div>
        </div>
      </div>
    </div>
  );
}
