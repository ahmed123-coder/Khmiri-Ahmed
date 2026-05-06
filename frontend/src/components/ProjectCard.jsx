import { Link } from "react-router-dom";

export const ProjectCard = ({ title, description, imgUrl, images, slug, id }) => {
  return (
    <Link to={`/project/${slug || id}`} className="block group">
      <div className="relative overflow-hidden rounded-3xl bg-[#121212] border border-white/5 transition-all duration-500 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
        <div className="aspect-[4/3] overflow-hidden relative">
          {imgUrl && (
            <img 
              src={imgUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" 
            />
          )}
          
          {/* Gallery Peek (Rest of images) */}
          {images && images.length > 0 && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
              {images.slice(0, 3).map((img, i) => (
                <div key={i} className="w-12 h-12 rounded-lg border border-white/20 shadow-lg overflow-hidden backdrop-blur-md bg-white/10 p-0.5">
                  <img src={img} className="w-full h-full object-cover rounded-md" alt="" />
                </div>
              ))}
              {images.length > 3 && (
                <div className="w-12 h-12 rounded-lg border border-white/20 shadow-lg flex items-center justify-center bg-black/40 backdrop-blur-md text-white text-[10px] font-bold">
                  +{images.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Overlay info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
          <h4 className="text-2xl font-bold text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{title}</h4>
          <p className="text-white/70 text-sm line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{description}</p>
        </div>

        {/* Static info */}
        <div className="p-6 bg-gradient-to-b from-white/[0.02] to-transparent">
          <h4 className="text-xl font-bold text-white truncate group-hover:text-purple-400 transition-colors">{title}</h4>
          <div className="flex items-center justify-between mt-1">
            <p className="text-white/40 text-xs truncate max-w-[70%]">{description}</p>
            {images && images.length > 0 && (
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">{images.length + 1} SHOTS</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

