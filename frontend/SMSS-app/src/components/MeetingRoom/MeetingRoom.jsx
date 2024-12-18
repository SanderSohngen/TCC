import { useEffect } from 'react';
import { useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import { Flex, Button, AspectRatio } from '@chakra-ui/react';
import {
	AudioInputControl,
	AudioOutputControl,
	VideoInputControl,
	ControlBar,
	VideoTileGrid,
} from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';
import { useNavigate } from 'react-router-dom';

const MeetingRoom = ({ meetingData }) => {
	const meetingManager = useMeetingManager();
	const navigate = useNavigate();

	const joinMeeting = async () => {
		const { Meeting, Attendee } = meetingData;
		const meetingSessionConfiguration = new MeetingSessionConfiguration(Meeting, Attendee);

		await meetingManager.join(meetingSessionConfiguration);
		await meetingManager.start();
	};

  useEffect(() => {
    joinMeeting();
  }, []);

	const handleLeaveMeeting = async () => {
		try {
			await meetingManager.leave();
			navigate('/');
		} catch (error) {
			console.error('Erro ao sair da consulta:', error);
		}
	};

	return (
		<Flex
			direction="column"
			maxW="1920px"
			w="100%"
			mx="auto"
		>
			<AspectRatio ratio={16 / 9} flex="1" bg="gray.800" mb={4}>
				<VideoTileGrid />
			</AspectRatio>
			<ControlBar layout="undocked-horizontal">
				<AudioInputControl />
				<AudioOutputControl />
				<VideoInputControl />
				<Button onClick={handleLeaveMeeting} colorScheme="red">
					Sair da Consulta
				</Button>
			</ControlBar>
		</Flex>
	);
};

export default MeetingRoom;