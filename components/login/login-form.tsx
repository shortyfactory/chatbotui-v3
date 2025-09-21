'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/ui/submit-button';
import { Brand } from '@/components/ui/brand';
import Image from "next/image"


const Styles = {
  divStyles: {
      width: "100%",
      color: "#424141",
  },
  pStyles: {
  },
  borderShadowStyles: {
      border: "1px solid #424141",
      paddingRight: "14px",
      color: "rgb(163 163 163/var(--tw-text-opacity))",
  },
  textStyles: {
      color: "black",
  },   
  InfoText: {
      twTextOpacity: "1",
      color: "rgb(163 163 163/var(--tw-text-opacity))",
      fontSize: "14px",
  },  
  textLink: {
     color: "#FFCC00",
     textDecoration: "underline",
  },  
  textleftspace: {
     marginLeft: "16px",
     accentColor: "#fecc00",
  }, 
  headText: {
     textAlign: "center",
     color: "#F2F2F2",
     fontSize: "32px",
     marginBottom: "24px",
  }, 
  loadingStyles: {
margin: "auto",
display: "block",
  },

};


interface SearchParams {
  message?: string;
  magic?: string;
}

interface LoginFormClientProps {
  isMagicLinkEnabled: boolean;
  searchParams: SearchParams;
}

// Define allowed domains and authorized emails
const allowedDomains = ['eco3.be'];
const authorizedEmails = ['shortyfactory@gmail.com', 'misha.tret.ua@gmail.com'];

export default function LoginFormClient({
  isMagicLinkEnabled,
  searchParams,
}: LoginFormClientProps) {
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsAccepted(e.target.checked);
  };

  const handleSubmit = async (action: string) => {
    // Extract email domain
    const emailDomain = email.split('@')[1];

    // Check if email is authorized by domain or specific email address
    const isAuthorized = allowedDomains.includes(emailDomain) || authorizedEmails.includes(email);

    if (!isAuthorized) {
      setErrorMessage(`This email is not authorized for login.`);
      return;
    }

    try {
      const response = await fetch("/api/auth/login-handler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          data: { email, password },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data?.redirectUrl;
      } else {
        const { message } = await response.json();
        setErrorMessage(message);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      {searchParams?.magic !== "true" && (
        <div
          className="animate-in text-foreground flex w-full flex-1 flex-col justify-center gap-2"
        >
          
          <div className="text-3xl font-bold tracking-wide">AI Chatbot</div>

          <div className="mb-2">
            <Image
              src="/chatbot-ui-logo.png"
              width={830}
              height={1054}
              alt="AI Chatbot"
            />
          </div>

          <div className="card mb-6" style={Styles.pStyles}>
              <div className="card-body" style={Styles.borderShadowStyles}>
                  <div className="relative m-auto flex p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                     <div className="min-w-[40px] text-right font-bold">
                        <svg fill="#ffa200" width="50px" height="50px" viewBox="-441.6 -441.6 2803.20 2803.20" xmlns="http://www.w3.org/2000/svg" stroke="#ffa200" stroke-width="0.019200000000000002">
                           <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                           <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="38.4"></g>
                           <g id="SVGRepo_iconCarrier">
                              <path d="M960 0c530.193 0 960 429.807 960 960s-429.807 960-960 960S0 1490.193 0 960 429.807 0 960 0Zm0 101.053c-474.384 0-858.947 384.563-858.947 858.947S485.616 1818.947 960 1818.947 1818.947 1434.384 1818.947 960 1434.384 101.053 960 101.053Zm-42.074 626.795c-85.075 39.632-157.432 107.975-229.844 207.898-10.327 14.249-10.744 22.907-.135 30.565 7.458 5.384 11.792 3.662 22.656-7.928 1.453-1.562 1.453-1.562 2.94-3.174 9.391-10.17 16.956-18.8 33.115-37.565 53.392-62.005 79.472-87.526 120.003-110.867 35.075-20.198 65.9 9.485 60.03 47.471-1.647 10.664-4.483 18.534-11.791 35.432-2.907 6.722-4.133 9.646-5.496 13.23-13.173 34.63-24.269 63.518-47.519 123.85l-1.112 2.886c-7.03 18.242-7.03 18.242-14.053 36.48-30.45 79.138-48.927 127.666-67.991 178.988l-1.118 3.008a10180.575 10180.575 0 0 0-10.189 27.469c-21.844 59.238-34.337 97.729-43.838 138.668-1.484 6.37-1.484 6.37-2.988 12.845-5.353 23.158-8.218 38.081-9.82 53.42-2.77 26.522-.543 48.24 7.792 66.493 9.432 20.655 29.697 35.43 52.819 38.786 38.518 5.592 75.683 5.194 107.515-2.048 17.914-4.073 35.638-9.405 53.03-15.942 50.352-18.932 98.861-48.472 145.846-87.52 41.11-34.26 80.008-76 120.788-127.872 3.555-4.492 3.555-4.492 7.098-8.976 12.318-15.707 18.352-25.908 20.605-36.683 2.45-11.698-7.439-23.554-15.343-19.587-3.907 1.96-7.993 6.018-14.22 13.872-4.454 5.715-6.875 8.77-9.298 11.514-9.671 10.95-19.883 22.157-30.947 33.998-18.241 19.513-36.775 38.608-63.656 65.789-13.69 13.844-30.908 25.947-49.42 35.046-29.63 14.559-56.358-3.792-53.148-36.635 2.118-21.681 7.37-44.096 15.224-65.767 17.156-47.367 31.183-85.659 62.216-170.048 13.459-36.6 19.27-52.41 26.528-72.201 21.518-58.652 38.696-105.868 55.04-151.425 20.19-56.275 31.596-98.224 36.877-141.543 3.987-32.673-5.103-63.922-25.834-85.405-22.986-23.816-55.68-34.787-96.399-34.305-45.053.535-97.607 15.256-145.963 37.783Zm308.381-388.422c-80.963-31.5-178.114 22.616-194.382 108.33-11.795 62.124 11.412 115.76 58.78 138.225 93.898 44.531 206.587-26.823 206.592-130.826.005-57.855-24.705-97.718-70.99-115.729Z" fill-rule="evenodd"></path>
                           </g>
                        </svg>
                     </div>
                     <div className="prose mt-[-2px] w-full dark:prose-invert">
                        <div className="flex flex-row">
                           <div className="prose dark:prose-invert flex-1">
                              <p style={Styles.InfoText}>I confirm that I have completed the <a target="_blank" href="" style={{color: '#FFCC00', textDecoration: 'underline' }}>AI Training</a> and that I have read and agree with the <a target="_blank" href="" style={{color: '#FFCC00', textDecoration: 'underline' }}>Group Policy on the Use of Generative AI</a>. 
                                 I acknowledge the importance of adhering to these guidelines to maintain the integrity and effectiveness of our AI Chatbot</p>
                           </div>
                           <div className="md:-mr-8 ml-1 md:ml-0 flex flex-col md:flex-row gap-4 md:gap-1 items-center md:items-start justify-end md:justify-start">
                              <button className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="tabler-icon tabler-icon-copy">
                                    <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
                                    <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
                                 </svg>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
              </div>
            </div>

          <div className="flex gap-4 mt-4">
            <Label className="text-md" htmlFor="terms">
              Accept terms and conditions:
            </Label>

            <Input
              type="checkbox"
              className="bg-white h-5 w-5"
              name="terms"
              required
              onChange={handleCheckboxChange}
            />
          </div>

          <Label className="text-md mt-4" htmlFor="email">
            Email
          </Label>
          <Input
            className="mb-3 rounded-md border bg-inherit px-4 py-2"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={!isTermsAccepted}
          />

          {!isMagicLinkEnabled && (
            <>
              <Label className="text-md" htmlFor="password">
                Password
              </Label>
              <Input
                className="mb-6 rounded-md border bg-inherit px-4 py-2"
                type="password"
                name="password"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}

          <button
            className="mb-2 rounded-md bg-blue-700 px-4 py-2 text-white" style={{ backgroundColor: '#FDC400' }}
            onClick={() => handleSubmit("signIn")}
          >
            Login
          </button>

          {!isMagicLinkEnabled && (
            <>
              <SubmitButton
                onClick={() => handleSubmit("signUp")}
                className="border-foreground/20 mb-2 rounded-md border px-4 py-2"
              >
                Sign Up
              </SubmitButton>

              <div className="text-muted-foreground mt-1 flex justify-center text-sm">
                <span className="mr-1">Forgot your password?</span>
                <button
                  onClick={() => handleSubmit("resetPassword")}
                  className="text-primary ml-1 underline hover:opacity-80"
                >
                  Reset
                </button>
              </div>
            </>
          )}

          {errorMessage && (
            <p className="text-red-600 mt-4 p-4 text-center">
              {errorMessage}
            </p>
          )}

          {searchParams?.message && (
            <p className="bg-foreground/10 text-foreground mt-4 p-4 text-center">
              {searchParams.message}
            </p>
          )}
        </div>
      )}
      {searchParams?.magic === "true" && (
        <div className="animate-in text-foreground flex w-full flex-1 flex-col justify-center gap-2">
          <Brand />

          <Label className="text-xl mt-4 text-center">
            <p>Magic link sent.</p>
            <p>Please check your email to continue.</p>
          </Label>
        </div>
      )}
    </div>
  );
}

