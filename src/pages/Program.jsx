import Hero from '../components/sections/Hero';
import ProgramCards from '../components/sections/ProgramCards';

export default function Program() {
  return (
    <>
      <Hero
        title="Program dan Inisiatif"
        subtitle="Berbagai inisiatif dan program yang kami jalankan untuk memperkuat ekosistem demokrasi dan reformasi kepemiluan di Indonesia."
      />
      <ProgramCards showIntro={false} />
    </>
  );
}
