import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter, } from 'react-router-dom';
import { REMOVE_ONLINE_USER, } from '../../redux/auth/types';

// context
import { ChatContext, } from '../../containers/Chat/Context/ChatContext';

// socket
import socket from '../../utils/socket';

// react-router
import { Link } from 'react-router-dom';

// styled components
import styled from 'styled-components';

// rebass
import { Flex, Input, } from 'rebass';

// components
import Avatar from './Avatar';
import MessageCounter from './MessageCounter';

const mixinMobileSidebar = props => `
	left: ${props.variant.showSideList ? 0 : '-265px'};
	position: fixed;
	height: 100%;
	box-shadow: ${props.theme.shadows.right};
	overflow: hidden;	
	transition: all ${props.variant.showSideList ? '270ms ease-in' : '130ms ease-out'};
`;

// intern components
const BoxWrapper = styled(Flex)`
    display: flex;
    flex-direction: column;
		flex-shrink: 0;
		background-color: ${props => props.theme.colors.graydark};
		width: 15rem;

		/* 48em */
		@media (max-width: 26.24em) {
			/* when sidelist is open on mobile devices */
			${mixinMobileSidebar}
			width: ${props => props.variant.showSideList ? '80%' : '15rem'};
		}

		@media (min-width: 26.25em) and (max-width: 48em) {
			${mixinMobileSidebar}
			/* width: ${props => props.variant.showSideList ? '15rem' : 0}; */
			width: 15rem;
		}
`;

const Header = styled.div`
		display: flex;
		justify-content: center;
		align-items: center;

    padding: 0 0.625rem;
    color: white;
		box-shadow: ${props => props.theme.shadows.bottom};
		height: 3rem;

		@media (max-width: 48em) {
			/* when sidelist is open on mobile devices */
			box-shadow: none;
		}
`;

const Body = styled(Flex)`
    flex: 1;
    padding-top: 1.25rem;
    overflow-y: auto;
    color: white;

    ::-webkit-scrollbar {
        width: 6px;
    }
 
    ::-webkit-scrollbar-thumb {
        background-color: ${props => props.theme.colors.grayxdark};
    }
`;

const InputWrapper = styled.div`
	background-color: rgba(0,0,0,.2);
	border-radius: 4px;
	border: 1px solid rgba(0,0,0,.1);
	padding: 0.125rem;
	flex: 1;
`;

const CustomInput = styled(Input)`
	font-weight: 500;
`;

const Footer = styled(Flex)`
    padding: 0.9375rem 0.625rem;
    color: white;
    background-color: rgba(32,34,37,.3);
		font-size: 0.875rem;
		
		& > span {
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
`;

const SideListButton = styled(Link)`
		display: flex;	
		align-items: center;
		flex-shrink: 0;
		text-decoration: none;
		margin: 0.0625rem .5rem;
		padding: .3rem .5rem;
		border-radius: 3px;
		color: #fff;
		background-color: ${p => p.variant.isSelected ? p.theme.colors.graylight : 'transparent'};		

		&:hover {
			background-color: ${props => props.theme.colors.graysoft};
			opacity: 1;
		}

		& > span {
			flex: 1;
			overflow: hidden;
    	text-overflow: ellipsis;
    	white-space: nowrap;
			opacity: .3;
		}
`;

const SideListText = styled.div`
		text-align: center;
		margin: 0.0625rem .5rem;
		padding: .3rem .5rem;
		color: #fff;
		opacity: .3;
`;

const ModalBackground = styled.div`
		position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #000000a3;
`;

class SideList extends Component {
	state = {}

	componentDidMount() {
		this.getDisconnectedUser();
	}

	handleClickButton = (value) => {
		this.joinPrivateRoom(value);
		this.showSidebar(false);
	}

	joinPrivateRoom = (value) => {
		socket.emit('join private room', {
			receiverId: value._id,
		});
	}

	getDisconnectedUser() {
		socket.on('disconnected user', ({ userId }) => {
			this.props.dispatch({
				type: REMOVE_ONLINE_USER.SUCCESS,
				userId,
			});
		});
	}

	showSidebar = (isOpen) => {
		const { chatContext } = this.props;

		chatContext.actions.showSideList(isOpen);
	}

	render() {
		const { chatContext, onlineUsers, nickname, match: { params, } } = this.props;

		return (
			<React.Fragment>
				{chatContext.state.sideList.isOpen &&
					<ModalBackground
						onClick={() => this.showSidebar(false)}
					/>
				}

				<BoxWrapper
					width={[2 / 12]}
					variant={{
						showSideList: chatContext.state.sideList.isOpen
					}}
				>
					<Header
						variant={{
							showSideList: chatContext.state.sideList.isOpen
						}}
					>
						<InputWrapper>
							<CustomInput
								placeholder="Start a conversation"
								fontSize="0.75rem"
								py="5px"
								px="7px"
							/>
						</InputWrapper>
					</Header>
					<Body
						flexDirection="column"
					>

						{!onlineUsers.length &&
							<SideListText>
								Nobody is online :(
						</SideListText>
						}

						{onlineUsers.map((val, index) => (
							<SideListButton
								key={index}
								to={`/chat/${val._id}`}
								onClick={() => this.handleClickButton(val)}
								variant={{
									isSelected: val._id === params.id,
								}}
							>
								<React.Fragment>
									<Avatar
										width="30px"
										height="30px"
										m="0 .75rem 0 0"
									/>
									<span>{val.nickname}</span>

									<MessageCounter
										userId={val._id}
									/>
								</React.Fragment>
							</SideListButton>
						))}
					</Body>
					<Footer>
						<span>{nickname}</span>
					</Footer>
				</BoxWrapper>
			</React.Fragment>
		);
	}
}

SideList.propTypes = {
	nickname: PropTypes.string.isRequired,
	onlineUsers: PropTypes.array.isRequired,
}

const withContextConsumer = props => (
	<ChatContext.Consumer>
		{context =>
			<SideList {...props} chatContext={context} />
		}
	</ChatContext.Consumer>
);

export default withRouter(connect()(withContextConsumer));