#!/usr/bin/env python3

#!/usr/bin/env python3

"""
Given an icav2 uri, find all the vcf files in the directory and return a list of the files.
"""

# Standard imports
from typing import List

# Wrapica imports
from wrapica.project_data import (
    find_project_data_bulk,
    convert_uri_to_project_data_obj,
    convert_project_data_obj_to_uri
)
from wrapica.project_data import ProjectData

# Layer imports
from icav2_tools import set_icav2_env_vars
from wrapica.utils.globals import FILE_DATA_TYPE, S3_URI_SCHEME


def handler(event, context):
    """
    Use the project data bulk command to find all vcf files in the directory and zip them all up
    :param event:
    :param context:
    :return:
    """
    set_icav2_env_vars()

    icav2_uri = event.get("icav2Uri")

    data_obj: ProjectData = convert_uri_to_project_data_obj(icav2_uri)

    all_project_data: List[ProjectData] = find_project_data_bulk(
        project_id=str(data_obj.project_id),
        parent_folder_id=str(data_obj.data.id),
        data_type=FILE_DATA_TYPE
    )

    return {
        "vcfIcav2UriList": list(
            map(
                lambda project_data_iter: convert_project_data_obj_to_uri(
                    project_data_iter,
                    uri_type=S3_URI_SCHEME
                ),
                filter(
                    lambda project_data_iter: (
                        # Is a vcf file
                        (
                            (
                                project_data_iter.data.details.path.endswith(".vcf") or
                                project_data_iter.data.details.path.endswith(".gvcf")
                            ) and
                            project_data_iter.data.details.data_type == FILE_DATA_TYPE
                        )
                        and not  # .vcf.gz does not exist
                        any(
                            map(
                                lambda project_data_gzip_iter: (
                                    project_data_gzip_iter.data.details.path == (project_data_iter.data.details.path + ".gz")
                                ),
                                all_project_data
                            )
                        )
                    ),
                    all_project_data
                )
            )
        )
    }
