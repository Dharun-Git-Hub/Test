import React from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/Main/Main'
import TextEditor from './components/TextEditor/TextEditor'
import Coder from './components/Coder/Coder'
import MusicPlayer from './components/MusicPlayer/MusicPlayer'
import Login from './components/Login/Login'
import ImageGen from './components/ImageGen/ImageGen'
import Dashboard from './components/Dashboard/Dashboard'
import Maps from './components/Maps/Maps'
import Main2 from './components/Main2/Main2'
import SignUp from './components/SignUp/Signup'
import Coding from './components/Coding/Coding'
import Chats from './components/Chat/Chat'
import DocScanner from './components/DocScanner/DocScanner'

import { UserProvider } from './UserContext/UserContext'
import { CodeProvider } from './CodeProvider/CodeContext'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"


const App = () => {
  return (
    <CodeProvider>
    <UserProvider>
    <Router>
    <Routes>
      <Route path="/" element={<Login /> } />
      <Route path="/main" element={ <> <Sidebar /><Main /> </> } />
      <Route path="/text-editor" element={<TextEditor />} />
      <Route path="/coder" element={<Coder />} />
      <Route path="/musicplayer" element={<MusicPlayer />} />
      <Route path="/imagegen" element={<ImageGen />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/main2" element={<Main2 /> } />
      <Route path="/maps" element={<Maps /> } />
      <Route path="/signup" element={<SignUp /> } />
      <Route path="/coding" element={<><Coding /> <Main2 /></>} />
      <Route path="/chat" element={<Chats />} />
      <Route path="/scanner" element={<DocScanner />} />
     </Routes>
     </Router>
    </UserProvider>
   </CodeProvider>
    )
}

export default App