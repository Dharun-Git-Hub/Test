import React, { createContext, useState } from 'react';

export const CodeContext = createContext();

export const CodeProvider = ({ children }) => {
  const [codeInput, setCodeInput] = useState("");
  const [askedHelp, setAskedHelp] = useState(false);

  return (
    <CodeContext.Provider value={{ codeInput, setCodeInput, askedHelp, setAskedHelp }}>
      {children}
    </CodeContext.Provider>
  );
};
