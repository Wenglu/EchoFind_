import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "./MenuContent";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";

import { doc, getDoc, getFirestore } from "firebase/firestore";
import type { User } from "../../../types/user";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  marginTop: theme.spacing(10),
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
}));

export default function SideMenu() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          console.log("User is signed in with UID:", firebaseUser.uid);

          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as User;
              setCurrentUser(userData);
            } else {
              console.log("No such user document!");
              setCurrentUser(null);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
          height: 64,
          position: "relative",
        }}
      >
        <img
          src="/src/assets/logo.png"
          alt="Logo"
          style={{ position: "absolute", top: -55, left: -55, width: 350 }}
        />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sizes="small"
          alt={currentUser?.name || "User avatar"}
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: "auto" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: "16px" }}
          >
            {currentUser?.name || "Guest"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {currentUser?.email || "No email"}
          </Typography>
        </Box>
      </Stack>
    </Drawer>
  );
}
