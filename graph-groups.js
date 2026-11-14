// Display groups organize related records; they are not additional historical bodies.
window.CHURCHTREE_GROUPS = [
    ['Scottish Presbyterian foundations', ['church-of-scotland', 'presbyterian-polity-scotland']],
    ['Presbyterian migration and colonial organization', ['presbyterian-migrations-america', 'presbyterian-polity-founding-context']],
    ['American Presbyterian churches', ['pcusa-1789', 'pcus', 'upcna', 'upcusa', 'opc', 'pca', 'pcusa']],
    ['Continental Reformed foundations', ['swiss-reformed-zurich', 'genevan-reformed', 'english-congregation-geneva', 'scottish-reformation']],
    ['English Anglican foundations', ['english-reformation', 'church-of-england']],
    ['North American Anglican churches', ['episcopal-church', 'anglican-church-in-north-america']],
    ['Baptist and Separatist beginnings', ['english-separatists', 'early-baptist-amsterdam', 'baptist-movement']],
    ['American Baptist missions and conventions', ['triennial-convention', 'southern-baptist-convention', 'american-baptist-churches-usa', 'venture-church-network']],
    ['National Baptist conventions', ['national-baptist-convention-usa', 'national-baptist-convention-of-america', 'progressive-national-baptist-convention']],
    ['European Lutheran foundations', ['lutheran-reformation', 'german-lutheran-territorial-churches', 'scandinavian-lutheran-state-churches']],
    ['American Lutheran synods and unions', ['lutheran-church-missouri-synod', 'wisconsin-evangelical-lutheran-synod', 'american-lutheran-church', 'lutheran-church-in-america', 'association-of-evangelical-lutheran-churches', 'evangelical-lutheran-church-in-america']],
    ['Wesleyan movement and early Methodist churches', ['methodist-movement-england', 'methodist-episcopal-church', 'methodist-episcopal-church-south', 'methodist-protestant-church']],
    ['Methodist unions', ['methodist-church', 'evangelical-united-brethren-church', 'united-methodist-church']],
    ['Pentecostal movement and churches', ['pentecostalism', 'assemblies-of-god', 'church-of-god-cleveland', 'church-of-god-in-christ', 'foursquare-church']],
    ['Holiness movement and churches', ['holiness-movement', 'church-of-the-nazarene']],
    ['Restoration movement and churches', ['restoration-movement', 'christian-church-disciples-of-christ', 'churches-of-christ', 'independent-christian-churches']],
    ['Millerite and Adventist developments', ['millerism', 'seventh-day-adventist-church', 'advent-christian-church', 'church-of-god-seventh-day']]
].map(([name, members], i) => ({ id: 'group-' + i, name, members }));
window.churchClusterTitle = cluster => {
    if (cluster.members.length === 1)
        return cluster.members[0].short_label || cluster.members[0].name;
    const ids = cluster.members.map(n => n.id);
    const shared = (window.CHURCHTREE_GROUPS || [])
        .filter(group => ids.every(id => group.members.includes(id)))
        .sort((a, b) => a.members.length - b.members.length)[0];
    if (shared)
        return shared.name;
    const tradition = cluster.members[0].tradition_family || 'Other';
    const american = cluster.members.every(n => n.region === 'US' || n.geographic_origin === 'US');
    const churches = cluster.members.every(n => n.kind === 'denomination');
    return `${american ? 'American ' : ''}${tradition} ${churches ? 'churches' : 'developments'}`;
};
