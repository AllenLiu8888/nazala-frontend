const StorySection = () => {
    const worldnumber = 1;
    const story100 = "In the future, memory is no longer private—it is stored, traded, and controlled like currency. Governments and corporations manipulate recollections to shape loyalty, erase dissent, or invent false lives. Markets thrive on selling curated pasts, while citizens guard their memories as tightly as bank accounts. Society itself is rebuilt on the flow of memory, fragile and unstable. Every decision—whether to keep, trade, or resist—reshapes both personal identity and the collective order. In this world, truth blurs, freedom bends, and the politics of memory decides the fate of all.In the future, memory is no longer private—it is stored, traded, and controlled like currency. ";
    // const story90 =  "In the future, memory is no longer private—it is stored, traded, and controlled like currency. Governments and corporations manipulate recollections to shape loyalty, erase dissent, or invent false lives. Markets thrive on selling curated pasts, while citizens guard their memories as tightly as bank accounts. Society itself is rebuilt on the flow of memory, fragile and unstable. Every decision—whether to keep, trade, or resist—reshapes both personal identity and the collective order. In this world, truth blurs, freedom bends, and the politics of memory decides the fate of all."  
    return (
        <section className="flex-1 p-20 overflow-hidden">
            {/* 左侧内容 */}
            <h2 className="pixel-text mb-4">World {worldnumber}</h2>
            <p className="text-2xl leading-relaxed text-cyan-200">
            {story100}
            </p>
        </section>
        );
    };
    
    export default StorySection;