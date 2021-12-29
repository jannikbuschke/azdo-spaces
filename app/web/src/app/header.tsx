import React from "react"
import { Box, Heading, Flex, Text, Button } from "@chakra-ui/react"
import { Link } from "react-router-dom"

function MenuItem({ children }: any) {
  return (
    <Text mt={{ base: 4, md: 0 }} mr={6} display="block">
      {children}
    </Text>
  )
}

export function Header(props: any) {
  const [show, setShow] = React.useState(false)
  const handleToggle = () => setShow(!show)
  const [userName, setusername] = React.useState("")
  React.useEffect(() => {
    setusername(localStorage.getItem("username") || "")
  }, [])
  return (
    <Flex
      as="nav"
      // shadow="xl"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding={2}
      bg="teal.400"
      color="white"
      zIndex={999}
      {...props}
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg">
          azdo spaces
        </Heading>
      </Flex>

      <Box display={{ sm: "block", md: "none" }} onClick={handleToggle}>
        <svg
          fill="white"
          width="12px"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </Box>

      <Box
        display={{ sm: show ? "block" : "none", md: "flex" }}
        width={{ sm: "full", md: "auto" }}
        alignItems="center"
        flexGrow={1}
      >
        {/* <Link to="/admin">Admin</Link> */}
        {/* <MenuItem>Docs</MenuItem>
        <MenuItem>Examples</MenuItem>
        <MenuItem>Blog</MenuItem> */}
      </Box>

      <Box
        display={{ sm: show ? "block" : "none", md: "block" }}
        mt={{ base: 4, md: 0 }}
      >
        {userName}
        {/* <Button bg="transparent" border="1px">
          Create account
        </Button> */}
      </Box>
    </Flex>
  )
}

export default Header
