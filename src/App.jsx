import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Alchemy, Network } from "alchemy-sdk";

import { useState } from "react";

import { useAccount } from "wagmi";

function App() {
  // Defining state variables using useState hook
  const [userAddress, setUserAddress] = useState("");
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Retrieving connected wallet address, status and connection details using useAccount hook
  const { address, status, isConnected } = useAccount();

  // An async function that retrieves all ERC-721 tokens for a given owner
  async function getNFTsForOwner() {
    try {
      // Configuring the Alchemy API with the API key and network type
      const config = {
        apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
        network: Network.ETH_MAINNET,
      };

      // Creating an instance of Alchemy client
      const alchemy = new Alchemy(config);

      // Retrieving all ERC-721 tokens for a given owner
      const data = await alchemy.nft.getNftsForOwner(address || userAddress);
      console.log("getNftsForOwner", data);

      // Updating the state variable with the retrieved data
      setResults(data);

      // Retrieving metadata for each ERC-721 token using Promise.all() method
      const tokenDataPromises = [];

      for (let i = 0; i < data.ownedNfts.length; i++) {
        const tokenData = alchemy.nft.getNftMetadata(
          data.ownedNfts[i].contract.address,
          data.ownedNfts[i].tokenId
        );
        console.log("getNftMetadata", tokenData);
        tokenDataPromises.push(tokenData);
      }

      // Updating the state variable with the retrieved metadata
      setTokenDataObjects(await Promise.all(tokenDataPromises));
      setHasQueried(true);
    } catch (error) {
      // Logging the error to the console
      console.error(error);
    } finally {
      // Setting the loading state variable to false
      setLoading(false);
    }
  }

  // A function that updates the userAddress state variable with the input value
  const handleInputChange = ({ target }) => {
    setUserAddress(target.value);
  };

  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={"center"}
          justifyContent="center"
          flexDirection={"column"}
        >
          <ConnectButton />

          <Heading mb={0} fontSize={36}>
            NFT Indexer 🖼
          </Heading>
          <Text>
            Plug in an address and this website will return all of its NFTs!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={"center"}
      >
        <Heading mt={42}>Get all the ERC-721 tokens of this address:</Heading>
        <Input
          value={address ? address : userAddress}
          onChange={handleInputChange}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button
          fontSize={20}
          onClick={getNFTsForOwner}
          mt={36}
          bgColor="#1f1f1f"
          disabled={loading}
        >
          {loading ? "Loading..." : " Fetch NFTs"}
        </Button>

        <Heading my={36}>Here are your NFTs:</Heading>

        {hasQueried ? (
          <SimpleGrid w={"90vw"} columns={4} spacing={24}>
            {results.ownedNfts.map((e, i) => {
              return (
                <Flex
                  flexDir={"column"}
                  color="white"
                  bg="#1f1f1f"
                  w={"20vw"}
                  key={i}
                >
                  <Box>
                    <b>Collection:</b>{" "}
                    {tokenDataObjects[i].contract.name?.length === 0
                      ? "No Name"
                      : tokenDataObjects[i].contract.name}
                  </Box>
                  <Box>
                    <b>Name:</b>{" "}
                    {tokenDataObjects[i].title?.length === 0
                      ? "No Name"
                      : tokenDataObjects[i].title}
                  </Box>
                  <Image
                    src={
                      tokenDataObjects[i]?.rawMetadata?.image ??
                      "https://via.placeholder.com/200"
                    }
                    alt={"Image"}
                  />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          "Please make a query! The query may take a few seconds..."
        )}
      </Flex>
    </Box>
  );
}

export default App;
