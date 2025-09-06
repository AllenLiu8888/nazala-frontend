import WorldStatus from '../../components/dashboard/header/WorldStatus';
import Round from '../../components/dashboard/header/Round';
import UserStates from '../../components/dashboard/footer/UserStates';
import { Link } from 'react-router-dom';
import DecisionProgress from '../../components/dashboard/footer/DecisionProgress';
import StorySection from '../../components/dashboard/main/StorySection';
import Visualisation from '../../components/dashboard/main/Visualisation';

export default function Game() {
    return (
        <div className="h-full w-full flex flex-col">
            <header className="flex justify-between">
                <Round />
                <div className="w-px h-full border-3 border-cyan-300 mx-4"/>
                <WorldStatus />
            </header>

            <div className="h-full w-full flex border-5 border-cyan-300">
                <StorySection />
                <div className="w-px h-full border-3 border-cyan-300 mx-4"/>
                <Visualisation />
            </div>

            <footer className="flex justify-between">
                <UserStates />
                <div className="w-px h-10rem border-3 border-cyan-300 mx-4"/>
                <DecisionProgress />
            </footer>
        </div>
        );
    }
