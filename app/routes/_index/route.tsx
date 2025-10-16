import { useState, useEffect } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

import type {
  EmailFinderRequest,
  EmailFinderResponse,
  EmailFinderData,
  EmailVerifyRequest,
  EmailVerifyResponse,
  EmailVerifyData,
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

      const data = await response.json();

      // Handle different HTTP status codes
      if (!response.ok) {
        // Map HTTP status codes to appropriate responses
        switch (response.status) {
          case 400: // Bad Request - validation failed
            return Response.json(data, { status: 200 }); // Return as 200 for client handling
          case 401: // Unauthorized - Invalid API token
            return Response.json(data, { status: 200 });
          case 402: // Payment Required - Insufficient credits
            return Response.json(data, { status: 200 });
          case 429: // Rate Limit
            return Response.json(data, { status: 200 });
          case 524: // Timeout
            return Response.json(data, { status: 200 });
          default:
            return Response.json(data, { status: response.status });
        }
      }

      // Handle "failed" status even with 200 OK response
      if (data.status === "failed") {
        return Response.json(data, { status: 200 });
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

  // Handle Email Verify action
  if (actionType === "verifyEmail") {
    const email = formData.get("email") as string;
    const timeout = formData.get("verifyTimeout") as string;

    if (!email) {
      return Response.json(
        {
          status: "error",
          error: {
            code: "VALIDATION_ERROR",
            message: "Email is a required field",
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

    const requestBody: EmailVerifyRequest = {
      email,
      timeout: timeout ? parseInt(timeout) : 130000,
    };

    try {
      const response = await fetch(
        "https://api.clearout.io/v2/email_verify/instant",
        {
          method: "POST",
          headers: {
            Authorization: apiToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      // Handle different HTTP status codes
      if (!response.ok) {
        // Map HTTP status codes to appropriate responses
        switch (response.status) {
          case 400: // Bad Request - validation failed
            return Response.json(data, { status: 200 }); // Return as 200 for client handling
          case 401: // Unauthorized - Invalid API token
            return Response.json(data, { status: 200 });
          case 402: // Payment Required - Insufficient credits
            return Response.json(data, { status: 200 });
          case 429: // Rate Limit
            return Response.json(data, { status: 200 });
          case 524: // Timeout
            return Response.json(data, { status: 200 });
          default:
            return Response.json(data, { status: response.status });
        }
      }

      // Handle "failed" status even with 200 OK response
      if (data.status === "failed") {
        return Response.json(data, { status: 200 });
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
                : "Failed to connect to Email Verify API",
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
  const [activeTab, setActiveTab] = useState<"finder" | "verify">("finder");
  const [isClient, setIsClient] = useState(false);
  
  // Email Finder state
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [timeout, setTimeout] = useState("30000");
  
  // Email Verify state
  const [email, setEmail] = useState("");
  const [verifyTimeout, setVerifyTimeout] = useState("130000");

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const handleVerifyEmail = () => {
    const formData = new FormData();
    formData.append("actionType", "verifyEmail");
    formData.append("email", email);
    formData.append("verifyTimeout", verifyTimeout);
    fetcher.submit(formData, { method: "POST" });
  };

  const renderResults = () => {
    if (!fetcher.data) {
      return null;
    }

    const data = fetcher.data as EmailFinderResponse | EmailVerifyResponse;
    
    // Animation variants for cleaner code
    const containerVariants = isClient ? {
      initial: { scale: 0.95 },
      animate: { scale: 1 },
      transition: { duration: 0.3 }
    } : { initial: false };

    const cardVariants = isClient ? {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 }
    } : { initial: false };

    // Handle "failed" status from API
    if (data.status === "failed") {
      const errorCode = data.error.code;
      const errorMessage = data.error.message;
      const validationReasons = data.error.reasons;
      const timeoutInfo = data.error.additional_info;

      return (
        <motion.div 
          className={styles.resultsContent}
          {...containerVariants}
        >
          <motion.div 
            className={styles.errorCard}
            {...cardVariants}
            transition={isClient ? { delay: 0.1, duration: 0.4 } : undefined}
          >
            <div className={styles.errorIcon}>❌</div>
            <h3>Request Failed</h3>
            <div className={styles.errorDetails}>
              {errorCode && <p className={styles.errorCode}>Error Code: {errorCode}</p>}
              <p className={styles.errorMessage}>{errorMessage}</p>
              
              {/* Display validation errors */}
              {validationReasons && validationReasons.length > 0 && (
                <div className={styles.validationErrors}>
                  <h4>Validation Errors:</h4>
                  {validationReasons.map((reason, index) => (
                    <div key={index} className={styles.validationError}>
                      <strong>Field:</strong> {reason.field.join(", ")}
                      <br />
                      <strong>Messages:</strong> {reason.messages.join(", ")}
                    </div>
                  ))}
                </div>
              )}

              {/* Display timeout queue information */}
              {timeoutInfo && (
                <div className={styles.timeoutInfo}>
                  <h4>Timeout Information:</h4>
                  <p><strong>Queue ID:</strong> {timeoutInfo.queue_id}</p>
                  <p className={styles.timeoutNote}>
                    The email discovery is still running in the background. 
                    You can retrieve the result later using the Queue ID from 
                    Clearout App → My Activities.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      );
    }

    // Handle "error" status (internal errors)
    if (data.status === "error") {
      return (
        <motion.div 
          className={styles.resultsContent}
          {...containerVariants}
        >
          <motion.div 
            className={styles.errorCard}
            {...cardVariants}
            transition={isClient ? { delay: 0.1, duration: 0.4 } : undefined}
          >
            <div className={styles.errorIcon}>❌</div>
            <h3>Error</h3>
            <div className={styles.errorDetails}>
              <p className={styles.errorCode}>{data.error.code}</p>
              <p className={styles.errorMessage}>{data.error.message}</p>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    if (data.status === "success") {
      // Check if it's EmailVerifyData by checking for email_address property
      if ('email_address' in data.data && 'safe_to_send' in data.data) {
        const resultData = data.data as EmailVerifyData;
        return (
          <motion.div 
            className={styles.resultsContent}
            {...containerVariants}
          >
            <motion.div 
              className={styles.successCard}
              initial={isClient ? { opacity: 0 } : false}
              animate={isClient ? { opacity: 1 } : {}}
              transition={isClient ? { duration: 0.4 } : undefined}
            >
              <motion.div 
                className={styles.successHeader}
                {...cardVariants}
                transition={isClient ? { delay: 0.1, duration: 0.4 } : undefined}
              >
                <div className={styles.successIcon}>
                  {resultData.safe_to_send === "yes" ? "✅" : "⚠️"}
                </div>
                <div>
                  <h3>Email Verified</h3>
                  <p className={styles.confidence}>
                    Status: <strong>{resultData.status}</strong> • 
                    Safe to Send: <strong>{resultData.safe_to_send === "yes" ? "Yes" : "No"}</strong>
                  </p>
                </div>
              </motion.div>

              {resultData.ai_verdict && (
                <motion.div 
                  className={styles.aiVerdict}
                  {...cardVariants}
                  transition={isClient ? { delay: 0.2, duration: 0.4 } : undefined}
                >
                  <h4>🤖 AI Verdict</h4>
                  <p>{resultData.ai_verdict}</p>
                </motion.div>
              )}

              <motion.div 
                className={styles.infoCard}
                {...cardVariants}
                transition={isClient ? { delay: 0.3, duration: 0.4 } : undefined}
              >
                <h4>Email Details</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email Address</span>
                    <span className={styles.infoValue}>{resultData.email_address}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Status</span>
                    <span className={styles.infoValue}>{resultData.status}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Account</span>
                    <span className={styles.infoValue}>{resultData.detail_info.account}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Domain</span>
                    <span className={styles.infoValue}>{resultData.detail_info.domain}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>MX Record</span>
                    <span className={styles.infoValue}>{resultData.detail_info.mx_record}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>SMTP Provider</span>
                    <span className={styles.infoValue}>{resultData.detail_info.smtp_provider}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Verified On</span>
                    <span className={styles.infoValue}>
                      {new Date(resultData.verified_on).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Time Taken</span>
                    <span className={styles.infoValue}>{resultData.time_taken}ms</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className={styles.verifyBadgesSection}
                {...cardVariants}
                transition={isClient ? { delay: 0.4, duration: 0.4 } : undefined}
              >
                <h4>Verification Checks</h4>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${resultData.disposable === "no" ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {resultData.disposable === "no" ? "✓ Not Disposable" : "⚠ Disposable"}
                  </span>
                  <span className={`${styles.badge} ${resultData.free === "no" ? styles.badgeSuccess : styles.badgeInfo}`}>
                    {resultData.free === "no" ? "Business" : "Free Provider"}
                  </span>
                  <span className={`${styles.badge} ${resultData.role === "yes" ? styles.badgeInfo : styles.badgeSuccess}`}>
                    {resultData.role === "yes" ? "Role Email" : "Personal Email"}
                  </span>
                  <span className={`${styles.badge} ${resultData.gibberish === "no" ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {resultData.gibberish === "no" ? "✓ Valid Format" : "⚠ Gibberish"}
                  </span>
                </div>
              </motion.div>

              {resultData.suggested_email_address && (
                <motion.div 
                  className={styles.suggestionCard}
                  {...cardVariants}
                  transition={isClient ? { delay: 0.5, duration: 0.4 } : undefined}
                >
                  <h4>💡 Suggested Email</h4>
                  <p>{resultData.suggested_email_address}</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        );
      } else {
        // Email Finder result
        const resultData = data.data as EmailFinderData;
        return (
          <motion.div 
            className={styles.resultsContent}
            {...containerVariants}
          >
            <motion.div 
              className={styles.successCard}
              initial={isClient ? { opacity: 0 } : false}
              animate={isClient ? { opacity: 1 } : {}}
              transition={isClient ? { duration: 0.4 } : undefined}
            >
              <motion.div 
                className={styles.successHeader}
                {...cardVariants}
                transition={isClient ? { delay: 0.1, duration: 0.4 } : undefined}
              >
                <div className={styles.successIcon}>✅</div>
                <div>
                  <h3>Email Found</h3>
                  <p className={styles.confidence}>
                    {resultData.total} email(s) with {resultData.confidence_score}% confidence
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className={styles.infoCard}
                {...cardVariants}
                transition={isClient ? { delay: 0.2, duration: 0.4 } : undefined}
              >
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
              </motion.div>

              <motion.div 
                className={styles.emailsSection}
                {...cardVariants}
                transition={isClient ? { delay: 0.3, duration: 0.4 } : undefined}
              >
                <h4>Email Addresses</h4>
                {resultData.emails.map((email, index) => (
                  <motion.div 
                    key={index} 
                    className={styles.emailCard}
                    initial={isClient ? { x: -20, opacity: 0 } : false}
                    animate={isClient ? { x: 0, opacity: 1 } : {}}
                    transition={isClient ? { delay: 0.4 + (index * 0.1), duration: 0.4 } : undefined}
                  >
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
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        );
      }
    }

    return null;
  };

  return (
    <div className={styles.index}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Clearout Email Tools</h1>
          <p className={styles.subtitle}>
            Discover and verify email addresses instantly
          </p>
        </div>

        <div className={styles.mainContent}>
          {/* Left Column - Form */}
          <motion.div 
            className={styles.formSection}
            initial={false}
            animate={isClient ? { 
              width: fetcher.data ? "45%" : "100%",
              maxWidth: fetcher.data ? "500px" : "600px"
            } : {}}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className={styles.formCard}>
              {/* Tabs */}
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${activeTab === "finder" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("finder")}
                >
                  📧 Email Finder
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "verify" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("verify")}
                >
                  ✅ Email Verify
                </button>
              </div>

              {/* Email Finder Form */}
              {activeTab === "finder" && (
                <>
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
                </>
              )}

              {/* Email Verify Form */}
              {activeTab === "verify" && (
                <>
                  <h2 className={styles.formTitle}>Verify Email Address</h2>
                  <div className={styles.formInputs}>
                    <Input
                      id="email"
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., us@clearout.io"
                      helperText="Enter the email address to verify"
                    />

                    <Input
                      id="verifyTimeout"
                      label="Timeout (milliseconds)"
                      type="number"
                      value={verifyTimeout}
                      onChange={(e) => setVerifyTimeout(e.target.value)}
                      placeholder="130000"
                      min="10000"
                      max="180000"
                      helperText="Request wait time (default: 130000)"
                    />

                    <Button
                      onClick={handleVerifyEmail}
                      disabled={isLoading || !email}
                      isLoading={isLoading}
                      fullWidth
                      size="large"
                    >
                      {isLoading ? "Verifying Email..." : "Verify Email"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Right Column - Results (Initially Hidden) */}
          {isClient && (
            <AnimatePresence mode="wait">
              {fetcher.data && (
                <motion.div
                  className={styles.resultsSection}
                  initial={{ opacity: 0, x: 50, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "55%" }}
                  exit={{ opacity: 0, x: 50, width: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: "easeOut",
                    width: { duration: 0.5, ease: "easeInOut" }
                  }}
                >
                  {renderResults()}
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {!isClient && fetcher.data && (
            <div className={styles.resultsSection}>
              {renderResults()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
