import SubjectGrid from '../../components/SubjectGrid/SubjectGrid';

const MaterialsDashboard = () => {
    const title = (
        <header className="materials-header">
            <h1 className="materials-title">Матеріали</h1>
        </header>
    );

    const getRedirectPath = (subjectId) => `/materials/subject/${subjectId}`;

    return (
        <div className="materials-layout">
            <SubjectGrid 
                titleComponent={title}
                getBaseRedirectUrl={getRedirectPath}
            />
        </div>
    );

};

export default MaterialsDashboard;