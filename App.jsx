import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Card,
  Typography,
  Stack,
  Button,
  Divider,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BadgeIcon from "@mui/icons-material/Badge";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { celebrateAllSides } from "./confetti";
import { useEffect } from "react";

const App = () => {
  const [tab, setTab] = useState(0);

  const [verifyStarted, setVerifyStarted] = useState(false);
  const [panDone, setPanDone] = useState(false);
  const [aadharDone, setAadharDone] = useState(false);
  const [selfieDone, setSelfieDone] = useState(false);

  const [panDoc, setPanDoc] = useState(null)
  const [aadharDoc, setAadharDoc] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [panLoading, setPanLoading] = useState(false);
  const [panError, setPanError] = useState(false);
  const [aadharLoading, setAadharLoading] = useState(false);
  const [aadharError, setAadharError] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [selfieLoading, setSelfieLoading] = useState(false);
  const [selfieError, setSelfieError] = useState(false);

  const [finished, setFinished] = useState(false)
  const [loadSkeleton,setLoadSkeleton] = useState(false)

  const getUserDetails = async () => {
    try{
      setLoadSkeleton(true)
      const response = await axios.post('http://localhost:3000/user/getUser',{id:1})
      const data = await response.data
      if(data?.success === true){
        const panVerification = data?.result?.panVerified
        setVerifyStarted(panVerification)
        const aadharVerification = data?.result?.aadharVerified
        const selfieVerification = data?.result?.selfieVerified
        setPanDone(panVerification)
        setAadharDone(aadharVerification)
        setSelfieDone(selfieVerification)
        if(panVerification && aadharVerification && selfieVerification){
          setFinished(true)
          celebrateAllSides();
          return
        }
      }
      else{
        toast.error(data?.message)
      }
    }
    catch(err){
      console.log('Error while fetching your details!')
    }
    finally{
      setLoadSkeleton(false)
    }
  }

  useEffect(()=>{
    getUserDetails()
  },[])

  const handlePanUpload = async (file) => {
    try {
      if (!file) {
        toast.error("Please upload your PAN Document!");
        return;
      }

      setPanLoading(true);
      setPanError(false);
      const formData = new FormData();
      formData.append("document", file);

      const response = await axios.post(
        "http://localhost:3000/neokred/verify/pan",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const data = await response.data
      console.log(data)
      if (data?.success === true) {
        toast.success(data?.message);
        setPanDone(true);
      }
      else {
        toast.error(data?.message)
        setPanError(true)
        return
      }
    } catch (err) {
      toast.error("PAN Upload Failed!");
      setPanError(true);
    }
    finally {
      setPanLoading(false);
    }
  };

  const handleAadharUpload = async (file) => {
    try {
      if (!file) return toast.error("Please upload Aadhar!");

      setAadharLoading(true);
      setAadharError(false);
      const formData = new FormData();
      formData.append("document", file);

      const response = await axios.post(
        "http://localhost:3000/neokred/get/aadharOTP",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = await response.data

      if (data?.success === true) {
        toast.success("Aadhar Uploaded. OTP sent!");
        setOtpSent(true);
      }
      else {
        toast.error(data?.message)
        setAadharError(true);
        setOtpSent(false)
      }

    } catch (err) {
      toast.error("Aadhar Upload Failed!");
      setAadharError(true);
    }
    finally {
      setAadharLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setOtpLoading(true);
      const response = await axios.post(
        "http://localhost:3000/neokred/verify/aadharOTP",
        { otp }
      );

      const data = await response.data

      if (data?.success === true) {
        toast.success(data?.message);
        setAadharDone(true);
        setOtpSent(false);
      }
      else {
        toast.error(data?.message)
        setAadharDone(false)
        setOtp(false)
      }
    } catch (err) {
      toast.error("Invalid OTP!");
    }
    finally {
      setOtpLoading(false);
    }
  };

  const handleSelfieUpload = async (file) => {
    try {
      if (!file) return toast.error("Please upload your selfie!");

      setSelfieLoading(true);
      setSelfieError(false);
      const formData = new FormData();
      formData.append("face", file);

      const response = await axios.post(
        "http://localhost:3000/neokred/verify/faceMatch",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = await response.data

      if (data?.success === true) {
        toast.success(data?.message);
        setSelfieDone(true);
        setFinished(true);
        celebrateAllSides();
      }
      else {
        toast.error(data?.message)
        setSelfieDone(false);
        setSelfieError(true)
      }

    } catch (err) {
      toast.error("Selfie Upload Failed!");
      setSelfieError(true);
    }
    finally {
      setSelfieLoading(false);
    }
  };



  return (
    <Box
      sx={{
        backgroundColor: "#121212",
        minHeight: "100vh",
        p: 4,
        position: 'relative',
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {loadSkeleton ? <Skeleton variant="rectangular" sx={{background:'rgba(244, 217, 14, 0.1)',borderRadius:'13px'}} width={400} height={'50vh'}/>:
      <Box sx={{ width: 400 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: "orange" } }}
          sx={{
            mb: 3,
            "& .MuiTab-root": {
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "6px 6px 0 0",
            },
            "& .Mui-selected": {
              backgroundColor: "#1e1e1e",
              color: "orange",
              borderBottom: "none",
            },
          }}
        >
          <Tab label="Individual" sx={{ width: "50%" }} />
          <Tab label="Non Individual" sx={{ width: "50%" }} />
        </Tabs>

        <Card
          sx={{
            p: 3,
            backgroundColor: "#1c1c1c",
            color: "white",
            borderRadius: "12px",
            boxShadow: "0 0 10px rgba(0,0,0,0.4)",
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={2}>
            {finished ? "KYC Verification Successful 🎉" : "KYC Verification"}
          </Typography>

          <Divider sx={{ borderColor: "#333" }} />

          <Typography mt={2} mb={1} fontWeight={600}>
            Requirements
          </Typography>

          {/* STEP 1 */}
          <Stack spacing={1.5}>

            {/* STEP 1 — PAN */}
            <Stack direction="row" alignItems="center" spacing={1}>
              {panLoading && <CircularProgress size={24} sx={{ color: "orange" }} />}
              {!panLoading && panError && <CloseIcon sx={{ color: "red" }} />}
              {!panLoading && !panError && panDone && <CheckCircleIcon color="success" />}
              {!panLoading && !panError && !panDone && <CreditCardIcon sx={{color:'#fdad36ff'}} />}
              <Typography>PAN Card</Typography>
            </Stack>

            {verifyStarted && !panDone && (
              <>
                <input
                  type="file"
                  id="panUpload"
                  style={{ display: "none" }}
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setPanDoc(file);
                    handlePanUpload(file);
                  }}
                />
                <label htmlFor="panUpload">
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: "orange", color: "black", width: "150px" }}
                    component="span"
                    disabled={panLoading}
                  >
                    {panLoading ? 'Uploading...' : 'Upload PAN'}
                  </Button>
                </label>
              </>
            )}

            {/* STEP 2 — AADHAR */}
            <Stack direction="row" alignItems="center" spacing={1}>
              {aadharLoading && <CircularProgress size={24} sx={{ color: "orange" }} />}
              {!aadharLoading && aadharError && <CloseIcon sx={{ color: "red" }} />}
              {!aadharLoading && !aadharError && aadharDone && <CheckCircleIcon color="success" />}
              {!aadharLoading && !aadharError && !aadharDone && <BadgeIcon sx={{color:'#fdad36ff'}} />}
              <Typography>Aadhar Card</Typography>
            </Stack>

            {/* Upload Aadhar */}
            {panDone && !aadharDone && !otpSent && (
              <>
                <input
                  type="file"
                  id="aadharUpload"
                  style={{ display: "none" }}
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setAadharDoc(file);
                    handleAadharUpload(file);
                  }}
                />
                <label htmlFor="aadharUpload">
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: "orange", color: "black", width: "150px" }}
                    component="span"
                    disabled={aadharLoading}
                  >
                    {aadharLoading ? 'Uploading...' : 'Upload Aadhar'}
                  </Button>
                </label>
              </>
            )}

            {/* OTP INPUT */}
            {otpSent && !aadharDone && (
              <Stack spacing={1} mt={1}>
                <input
                  type="text"
                  placeholder="Enter OTP (6 digits)"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  maxLength="6"
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #333",
                    background: "#222",
                    color: "white",
                  }}
                />

                <Button
                  variant="contained"
                  size="small"
                  disabled={otp.length !== 6 || otpLoading}
                  sx={{
                    backgroundColor: "orange",
                    color: "black",
                    width: "150px",
                    display: "flex",
                    gap: "8px",
                    "&:disabled": { backgroundColor: "#888" }
                  }}
                  onClick={handleVerifyOtp}
                >
                  {otpLoading && <CircularProgress size={20} sx={{ color: "black" }} />}
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </Stack>
            )}

            {/* STEP 3 — SELFIE */}
            <Stack direction="row" alignItems="center" spacing={1}>
              {selfieLoading && <CircularProgress size={24} sx={{ color: "orange" }} />}
              {!selfieLoading && selfieError && <CloseIcon sx={{ color: "red" }} />}
              {!selfieLoading && !selfieError && selfieDone && <CheckCircleIcon color="success" />}
              {!selfieLoading && !selfieError && !selfieDone && <FaceRetouchingNaturalIcon sx={{color:'#fdad36ff'}} />}
              <Typography>Selfie Verification</Typography>
            </Stack>

            {/* Upload Selfie */}
            {aadharDone && !selfieDone && (
              <>
                <input
                  type="file"
                  id="selfieUpload"
                  style={{ display: "none" }}
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    handleSelfieUpload(file);
                  }}
                />
                <label htmlFor="selfieUpload">
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: "orange", color: "black", width: "150px" }}
                    component="span"
                    disabled={selfieLoading}
                  >
                    {selfieLoading ? 'Uploading...' : 'Upload Selfie'}
                  </Button>
                </label>
              </>
            )}

          </Stack>


          <Divider sx={{ my: 2, borderColor: "#333" }} />

          <Typography mb={1} fontWeight={600}>
            Benefits
          </Typography>

          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1} alignItems="center">
              {finished ? <CheckCircleIcon color="success" /> : <CheckCircleIcon sx={{color:'#fdad36ff'}} />}
              <Typography>Unlimited daily withdrawals</Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {finished ? <CheckCircleIcon color="success" /> : <CheckCircleIcon sx={{color:'#fdad36ff'}} />}
              <Typography>Unlimited lifetime withdrawals</Typography>
            </Stack>
          </Stack>

          {!verifyStarted && (
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.2,
                background: "linear-gradient(90deg,#ff9800,#F9EFAF,#ff9800)",
                color: "black",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#ff9800" },
              }}
              onClick={() => setVerifyStarted(true)}
            >
              Verify Now
            </Button>
          )}
        </Card>
      </Box>}
      <Toaster />
    </Box>
  );
};

export default App;

