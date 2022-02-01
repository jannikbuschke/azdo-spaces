import React from "react"

import {
  chakra,
  Box,
  Flex,
  useColorModeValue,
  VisuallyHidden,
  HStack,
  Button,
  useDisclosure,
  VStack,
  IconButton,
  CloseButton,
} from "@chakra-ui/react"
import { AiOutlineMenu } from "react-icons/ai"

export default function Gslr() {
  const bg = useColorModeValue("white", "gray.800")
  const mobileNav = useDisclosure()
  const [show, setShow] = React.useState(false)
  const handleToggle = () => setShow(!show)
  const [userName, setusername] = React.useState("")
  React.useEffect(() => {
    setusername(localStorage.getItem("username") || "")
  }, [])
  return (
    <React.Fragment>
      <chakra.header
        bg={bg}
        w="full"
        px={{ base: 2, sm: 4 }}
        py={4}
        shadow="md"
        zIndex={100}
      >
        <Flex alignItems="center" justifyContent="space-between" mx="auto">
          <Flex>
            <chakra.a
              href="/"
              title="Choc Home Page"
              display="flex"
              alignItems="center"
            >
              {/* <Logo /> */}
              <VisuallyHidden>Choc</VisuallyHidden>
            </chakra.a>
            <chakra.h1 fontSize="xl" fontWeight="medium" ml="2">
              azdo spaces
            </chakra.h1>
          </Flex>
          <HStack display="flex" alignItems="center" spacing={1}>
            <HStack
              spacing={1}
              mr={1}
              color="brand.500"
              display={{ base: "none", md: "inline-flex" }}
            >
              {/* <Button variant="ghost">Features</Button>
              <Button variant="ghost">Pricing</Button>
              <Button variant="ghost">Blog</Button>
              <Button variant="ghost">Company</Button> */}
              <Button variant="ghost">{userName}</Button>
            </HStack>
            <Button colorScheme="brand" size="sm">
              Get Started
            </Button>
            {/* <Box display={{ base: "inline-flex", md: "none" }}>
              <IconButton
                display={{ base: "flex", md: "none" }}
                aria-label="Open menu"
                fontSize="20px"
                color={useColorModeValue("gray.800", "inherit")}
                variant="ghost"
                icon={<AiOutlineMenu />}
                onClick={mobileNav.onOpen}
              />

              <VStack
                pos="absolute"
                top={0}
                left={0}
                right={0}
                display={mobileNav.isOpen ? "flex" : "none"}
                flexDirection="column"
                p={2}
                pb={4}
                m={2}
                bg={bg}
                spacing={3}
                rounded="sm"
                shadow="sm"
              >
                <CloseButton
                  aria-label="Close menu"
                  onClick={mobileNav.onClose}
                />


                <Button w="full" variant="ghost">
                  Sign in
                </Button>
                <Button w="full" variant="ghost">
                  {userName}
                </Button>

              </VStack>
            </Box> */}
          </HStack>
        </Flex>
      </chakra.header>
    </React.Fragment>
  )
}
