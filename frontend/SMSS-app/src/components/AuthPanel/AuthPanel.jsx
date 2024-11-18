import React, { useState } from 'react';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import Login from '../Login/Login';
import Signup from '../Signup/Signup';

const AuthPanel = () => {
	const [tabIndex, setTabIndex] = useState(0);

	const handleTabsChange = (index) => {
		setTabIndex(index);
	};

	return (
		<Box p={4}>
			<Tabs index={tabIndex} onChange={handleTabsChange} isFitted variant="enclosed">
				<TabList mb="1em">
					<Tab>Entrar</Tab>
					<Tab>Inscrever-se</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<Login />
					</TabPanel>
					<TabPanel>
						<Signup />
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Box>
	);
};

export default AuthPanel;