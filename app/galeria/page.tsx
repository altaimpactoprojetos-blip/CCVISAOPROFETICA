import type {Metadata} from "next";
import {PageHero} from "../../components/PageHero";
import {SiteShell} from "../../components/SiteShell";
import {formatDate} from "../../lib/content";
import type {GalleryRecord,PhotoRecord} from "../../lib/admin-types";
import {galleriesWithPhotos} from "../../lib/site-data";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Galeria"};
export default async function GaleriaPage(){
  let albums:GalleryRecord[]=[],photos:(PhotoRecord&{gallery_id:number})[]=[],failed=false;
  try {const result=await galleriesWithPhotos(true);albums=result.albums;photos=result.photos;}
  catch(error){console.error("Gallery unavailable",error);failed=true;}
  return <SiteShell><PageHero eyebrow="Nossa comunidade" title="Vivendo momentos juntos" description="Álbuns de cultos, células, batismos, conferências, eventos, jovens, crianças e projetos."/><section className="content-section"><div className="container-shell">{failed?<div className="panel p-8" role="status"><h2 className="text-xl font-bold">Galeria temporariamente indisponível</h2><p className="body-copy mt-3">Tente novamente em instantes para ver os registros da igreja.</p></div>:!albums.length?<div className="panel p-8"><h2 className="text-2xl font-bold">Registros da nossa comunidade</h2><p className="body-copy mt-4">As fotos oficiais dos cultos e eventos serão publicadas aqui.</p></div>:albums.map(album=><section key={album.id} className="gallery-album"><p className="eyebrow text-zinc-600">{album.category}{album.event_date?` · ${formatDate(album.event_date)}`:""}</p><h2 className="mt-3 text-3xl font-bold">{album.name}</h2><div className="gallery-images">{photos.filter(photo=>photo.gallery_id===album.id).map(photo=><figure key={photo.id}><a href={photo.image_url} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar: ${photo.alt_text || album.name}`}><img src={photo.image_url} alt={photo.alt_text || album.name} loading="lazy"/></a>{photo.alt_text&&<figcaption>{photo.alt_text}</figcaption>}</figure>)}</div>{!photos.some(photo=>photo.gallery_id===album.id)&&<p className="body-copy mt-4">As fotos deste álbum estarão disponíveis em breve.</p>}</section>)}</div></section></SiteShell>;
}
