UPDATE archive_collections
SET title = 'Tim Hammond Genital Autonomy Archive',
    institution = 'Digital Archive (Original housed at UMass Amherst)',
    description = 'This collection serves as the digital representation of the physical archive housed at the University of Massachusetts Amherst (Robert S. Cox Special Collections & University Archives Research Center). ' || description
WHERE slug = 'umass-ms-1205';
