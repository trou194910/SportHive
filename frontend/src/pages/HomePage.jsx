import React from 'react';
import FollowedActivitiesPanel from '../components/home/FollowedActivitiesPanel';
import AllActivitiesPanel from '../components/home/AllActivitiesPanel';

function HomePage() {
    return (
        <div className="h-screen pt-16">
            <div className="container mx-auto px-4 h-full">
                <main className="flex overflow-hidden h-full">
                    <aside className="w-4/12 h-full">
                        <div className="h-full bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                            <FollowedActivitiesPanel />
                        </div>
                    </aside>
                    <section className="w-8/12 h-full pl-4">
                        <div className="h-full bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                            <AllActivitiesPanel />
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default HomePage;