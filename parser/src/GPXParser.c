#include <stdio.h>
#include <libxml/parser.h>
#include <libxml/tree.h>
#include "GPXParser.h"
#include <math.h>
 
float calcDistance(float lat1, float lat2, float lon1, float lon2);
void deleteDummy(void * data);

bool validateGPXFile(char * filename, char * schemafile);
char *routeCompToJSON(int num,Route* route);

char *trackCompToJSON(int num,Track* track);

char *GPXfileDetailstoJSON( char *filename);
char * gpxDataToJSON(char *filename, char *name);
void deleteDummy(void * data){
    return;
}
int getNumWaypoints(const GPXdoc* doc){
     if(doc==NULL){
         return 0;
     }
     int num =0;
     for(Node *i = doc->waypoints->head;i!=NULL;i=i->next){
         num++;
     }
     return num;
 }
 
//Total number of routes in the GPX file
int getNumRoutes(const GPXdoc* doc){
      if(doc==NULL){
         return 0;
     }
     return(getLength(doc->routes));
 }
 
//Total number of tracks in the GPX file
int getNumTracks(const GPXdoc* doc){
      if(doc==NULL){
         return 0;
     }
     return(getLength(doc->tracks));
 }
 
//Total number of segments in all tracks in the document
int getNumSegments(const GPXdoc* doc){
      if(doc==NULL){
         return 0;
     }
     int num =0;
     for(Node *i = doc->tracks->head;i!=NULL;i=i->next){
         num += getLength(((Track*)i->data)->segments);
     }
     return num;
 }
 
//Total number of GPXData elements in the document
int getNumGPXData(const GPXdoc* doc){
      if(doc==NULL){
         return 0;
     }else{
     int num =0;
     
     for(Node *i = doc->waypoints->head;i!=NULL;i=i->next){
         Waypoint * w = (Waypoint*)i->data;
         num = num + getLength(w->otherData);
         if(strcmp(w->name,"")!=0){
             num++;
         }
     }
     Node* h;
     for(h=doc->routes->head;h!=NULL;h = h->next){
         num = num + getLength(((Route*) h->data)->otherData);
         Route * r = h->data;
         if(strcmp(r->name,"")!=0){
             num++;
         }
         Node* h2;
         for(h2=r->waypoints->head;h2!=NULL;h2 = h2->next){
              num = num + getLength(((Waypoint*)h2->data)->otherData);
              Waypoint *w2 = (Waypoint*)h2->data;
             if(strcmp(w2->name,"")!=0){
                num++;
            }
         }
     }
      Node* h3;
     for(h3=doc->tracks->head;h3!=NULL;h3 = h3->next){
         Track * t = h3->data;
         num = num + getLength(t->otherData);
         if(strcmp(t->name,"")!=0){
             num++;
            //  printf("here2 %d\n",num);
         }
        for(Node* h5=t->segments->head;h5!=NULL;h5=h5->next){
            TrackSegment *ts = h5->data;
            Node* h4;
            for(h4=ts->waypoints->head;h4!=NULL;h4 = h4->next){
                Waypoint *w3 = (Waypoint*)h4->data;
                num = num + getLength(w3->otherData);
               //  printf("here4 %d\n",num);
                if(strcmp(w3->name,"")!=0){
                    num++;
                  // printf("here5\n");
                }
            }
        }
     }
      return num;
     }
 }
 
// Function that returns a waypoint with the given name.  If more than one exists, return the first one.  
// Return NULL if the waypoint does not exist
Waypoint* getWaypoint(const GPXdoc* doc, char* name){
     if(doc == NULL){
         return NULL;
     }if(name==NULL){
         return NULL;
     }else{
         Waypoint *w;
         int flag =0;
         for(Node *n=doc->waypoints->head;n!=NULL;n=n->next){
             Waypoint *w2 = (Waypoint*)n->data;
             if(strcmp(w2->name,name)==0){
                 flag =1;
                 w=(Waypoint*)n->data;
             }
         }
         if(flag==0){
             return NULL;
         }
         return w;
     }
}
// Function that returns a track with the given name.  If more than one exists, return the first one. 
// Return NULL if the track does not exist 
Track* getTrack(const GPXdoc* doc, char* name){
       if(doc == NULL){
         return NULL;
     }if(name==NULL){
         return NULL;
     }else{
         Track *w;
         int flag =0;
         for(Node *n=doc->tracks->head;n!=NULL;n=n->next){
             Track *w2 = (Track*)n->data;
             if(strcmp(w2->name,name)==0){
                 flag =1;
                 w=(Track*)n->data;
             }
         }
         if(flag==0){
             return NULL;
         }
         return w;
     }
 }
// Function that returns a route with the given name.  If more than one exists, return the first one.  
// Return NULL if the route does not exist
Route* getRoute(const GPXdoc* doc, char* name){
    if(doc == NULL){
         return NULL;
     }if(name==NULL){
         return NULL;
     }else{
         Route *w;
         int flag =0;
         for(Node *n=doc->routes->head;n!=NULL;n=n->next){
             Route *w2 = (Route*)n->data;
             if(strcmp(w2->name,name)==0){
                 flag =1;
                 w=(Route*)n->data;
             }
         }
         if(flag==0){
             return NULL;
         }
         return w;
     }
 }
 
 
 
int compareWaypoints(const void *first, const void *second){
    return -1;
}
 
int compareRoutes(const void *first, const void *second){
    return -1;
}
 
int compareTracks(const void *first, const void *second){
    return -1;
}
 
int compareTrackSegments(const void *first, const void *second){
    return -1;
}
 
 
void deleteTrackSegment(void* data){
      if(data==NULL){
        return;
        }
        TrackSegment* wpttemp = (TrackSegment*)data;
        freeList(wpttemp->waypoints);
        free(wpttemp);
}
 
 
void deleteRoute(void *data){
    if(data==NULL){
        return;
    }
    Route* wpttemp = (Route*)data;
    free(wpttemp->name);
    freeList(wpttemp->otherData);
    freeList(wpttemp->waypoints);
    free(wpttemp);
}
 
void deleteTrack(void *data){
    if(data==NULL){
        return;
    }
    Track* wpttemp = (Track*)data;
    free(wpttemp->name);
    freeList(wpttemp->otherData);
    freeList(wpttemp->segments);
    free(wpttemp);
}
 
void deleteWaypoint(void *data){
    if(data==NULL){
        return;
    }
    Waypoint* wpttemp = (Waypoint*)data;
    free(wpttemp->name);
    freeList(wpttemp->otherData);
    free(wpttemp);
}
 
void deleteGPXdoc(GPXdoc* doc){
     if(doc==NULL){
        return;
    }else{
        GPXdoc *temp = doc;
        free(temp->creator);
        freeList(temp->tracks);
        freeList(temp->waypoints);
        freeList(temp->routes);
        free(doc);
        xmlCleanupParser();
    }
  
}
 
 
 
 
char* waypointToString(void *data){
    if(data==NULL){
        return NULL;
    }
    Waypoint *wpttemp =(Waypoint*)data;
    char *buffer = calloc(1000,sizeof(char));
    sprintf(buffer,"Waypoints: name: %s long: %f lat %f \n",wpttemp->name,wpttemp->longitude,wpttemp->latitude);
 
    return buffer;
}
 
char* trackSegmentToString(void* data){
       if(data==NULL){
        return NULL;
    }
    TrackSegment *wpttemp = (TrackSegment*)data;
    char *wptsdata = toString(wpttemp->waypoints);
    return wptsdata;
}
 
char* routeToString(void *data){
    if(data==NULL){
        return NULL;
    }
    Route *routetemp = (Route*)data;
    char *waydata = toString(routetemp->waypoints);
    char *routesdata = toString(routetemp->otherData);
    char *buffer = calloc(1000+strlen(routesdata),sizeof(char*));
    sprintf(buffer,"routes: data %s name: %s waypoints: %s\n",routesdata,routetemp->name,waydata);
    free(routesdata);
    free(waydata);
    return buffer;
}
 
char* trackToString(void *data){
    if(data==NULL){
        return NULL;
    }
    Track *routetemp = (Track*)data;
    char *segments = toString(routetemp->segments);
    char *routesdata = toString(routetemp->otherData);
    char *buffer = calloc(1000 * strlen(routesdata) + strlen(segments),sizeof(char)*1000);
    sprintf(buffer,"tracks: name: %s other: %s segments : %s\n",routetemp->name,routesdata, segments);
    free(routesdata);
    free(segments);
    return buffer;
}
 
 
 
char* GPXdocToString(GPXdoc *doc){
     if(doc==NULL){
        return NULL;
    }
    GPXdoc *temp = (GPXdoc*)doc;
    char *w = toString(temp->waypoints);
    char *r = toString(temp->routes);
    char *tr = toString(temp->tracks);
    printf("%s\n",w);
    printf("%s\n",r);
    printf("%s\n",tr);
    printf("creator: %s\n",doc->creator);
    printf("namespace: %s\n",doc->namespace);
    free(w);
    free(r);
    free(tr);
    return NULL;
}
 
 
int compareGpxData(const void *first, const void *second){
    return -1;
}
void deleteGpxData(void *data){
    if(data==NULL){
        return;
    }
    GPXData *datatemp = (GPXData*)data;
    free(datatemp);
}
 
GPXData* createGPX(char *node, char *data){
    if(node==NULL){
        return NULL;
    }if(data==NULL){
        return NULL;
    }else{
        GPXData * doc = calloc(1,sizeof(GPXData)+286);
        strcpy(doc->value,data);
        strcpy(doc->name,node);
        return doc;
    }
}
 
GPXData* setGPX(xmlNode * node){
    return createGPX((char*)node->name,(char*)node->children->content);
}
 
char * strSplit(char* string, int i, int e){
    if(string == NULL){
        return NULL;
    }
    if(i<0|| i>strlen(string)|| ( e<0 )|| (e>strlen(string)) || (i>e)){
        return NULL;
    }
    char* string1 = calloc((e-i)+1000,sizeof(char));
    int l =0;
    int index=0;
    for(l=i;l<e;l++){
        string1[index] = string[l];
        index++;
    }
    return string1;
}
 
char* getWps(xmlNode* wps){
    xmlNode *node = NULL;
    xmlNode *i;
    for (i = wps->children; (i != NULL); i = i->next){
        char *name = (char*)i->name;
        if(strcmp(name,"name")==0){
            node = i->children;
            break;
        }
    }
    if(node == NULL){
        return "";
    }
    char *namespace=(char*)node->content;
    if(namespace ==NULL){
        return "";
    }
    return namespace;
}
 
Waypoint* createway(char * node,double longitude,double latitude){
      if(node ==NULL){
        return NULL;
    }else if((latitude < -90.00) || (latitude > 90.00) || (longitude > 180.00) || (longitude < -180.00) ){
        return NULL;
    }else{
        Waypoint* newwpt = calloc(1,sizeof(Waypoint));
        newwpt->latitude=latitude;
        newwpt->longitude=longitude;
        newwpt->name =strSplit(node,0,strlen(node)); 
        newwpt->otherData=initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
        return newwpt;
    }
}
 
Waypoint *makeNewWaypoint(xmlNode *wps){
    char* node = getWps(wps);
    double latitude = 0.0;
    double longitude = 0.0;
    xmlAttr *attr;
    for (attr = wps->properties; attr != NULL; attr = attr->next){
        xmlNode *value = attr->children;
        char *attrName = (char *)attr->name;
        char *cont = (char *)(value->content);
        if(strcmp(attrName,"lat")==0){
                latitude = atof(cont);
        }if(strcmp(attrName,"lon")==0){
                longitude = atof(cont);
        }
    }
  
    Waypoint *new = createway(node,longitude,latitude);
    xmlNode * attr2;
     // printf("5\n");
    for (attr2 = wps->children; attr2 != NULL; attr2 = attr2->next){
        char * wptname = (char*)attr2->name;
        char* name1 = (char*)attr2->name;
      //    printf("5.5\n");
        if(strcmp(wptname,"name")!=0 && (strcmp(name1,"text")!=0)){
        //      printf("6\n");
            GPXData * gpxd = setGPX(attr2);
            insertBack(new->otherData,gpxd);
        }
    }
   //   printf("7\n");
    return new;
}
 
 
char* GPXtostring(GPXdoc *doc){
    if(doc==NULL){
        return NULL;
    }
    GPXdoc *temp = (GPXdoc*)doc;
    char *w = toString(temp->waypoints);
    char *r = toString(temp->routes);
    char *tr = toString(temp->tracks);
    printf("%s\n",w);
    printf("%s\n",r);
    printf("%s\n",tr);
    printf("creator: %s\n",doc->creator);
    printf("namespace: %s\n",doc->namespace);
    free(w);
    free(r);
    free(tr);
    return NULL;
}
 
char* gpxDataToString(void *data){
    if(data==NULL){
        return NULL;
    }
    GPXData *gpxtemp = (GPXData*)data;
    char *buffer = calloc(1000+strlen(gpxtemp->name)+strlen(gpxtemp->value),sizeof(char));
    sprintf(buffer,"gpxData: %s | %s\n",gpxtemp->name,gpxtemp->value);
    return buffer;
}
 
 
GPXdoc* createGPXdoc(char* fileName){
    xmlDoc *doc = NULL;
    xmlNode *root_element = NULL;
    GPXdoc *gpxdoc = calloc(1,sizeof(GPXdoc));
    gpxdoc->routes = initializeList(&routeToString,&deleteRoute,&compareRoutes);
    gpxdoc->tracks = initializeList(&trackToString,&deleteTrack,&compareTracks);
    gpxdoc->waypoints = initializeList(&waypointToString,&deleteWaypoint,&compareWaypoints);
    
    doc = xmlReadFile(fileName, NULL, 0);
    root_element = xmlDocGetRootElement(doc);
 
    if (doc == NULL) {
        printf("error: could not parse file %s\n", fileName);
        return NULL;
    }
    xmlAttr *attr;
     for (attr = root_element->properties; attr != NULL; attr = attr->next){
          xmlNode *value = attr->children;
          char *attrName = (char *)attr->name;
          char *cont = (char *)(value->content);
           if (strcmp(attrName,"version")==0){
                gpxdoc->version = atof(cont);
            }if (strcmp(attrName,"creator")==0){
                gpxdoc->creator=malloc(sizeof(cont)+256);
                strcpy(gpxdoc->creator,cont);
            }
     }
     char* namespace = (char*)(root_element)->ns->href;
     if(namespace==NULL || (strlen(namespace)==0)){
         strcpy(gpxdoc->namespace,"no ns");
     }else{
         strcpy(gpxdoc->namespace,namespace);
     }
 
    xmlNode* children;
    Waypoint* waypts;
 
    for (children = root_element->children; children != NULL; children = children->next){
        char* pointname = (char*)children->name;
        if (strcmp(pointname,"wpt")==0){
                waypts = makeNewWaypoint(children);
                insertBack(gpxdoc->waypoints,waypts);
        }if (strcmp(pointname,"rte")==0){
                    // rtepts = makeNewRoute(children);
                    Route *newrt = malloc(sizeof(Route));
                    newrt->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
                    newrt->waypoints = initializeList(&waypointToString,&deleteWaypoint,&compareWaypoints);
                    xmlNode *attr;
                    newrt->name = malloc(strlen((char*)children->children->content)+256);
                    strcpy(newrt->name,"");
                   // printf(" pointname: %s tesssst\n",pointname);
                    for (attr = children->children; attr != NULL; attr = attr->next){
                        char * attrName = (char*)(attr->name);
                        if(strcmp(attrName,"name")==0){
                         //   printf("name test\n");
                            free(newrt->name);
                            newrt->name = malloc(strlen((char*)attr->children->name)*155);
                            strcpy(newrt->name,(char*)attr->children->content);
                        }else if(strcmp(attrName,"rtept")==0){
                            xmlAttr *attr2;
                             Waypoint *wroute = malloc(sizeof(Waypoint)*100);
                             wroute->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
                             wroute->name = malloc(100);
                             strcpy(wroute->name,"");
                                for (attr2 = attr->properties; attr2 != NULL; attr2 = attr2->next){
                                //    printf("in rtept loop\n");
                                    xmlNode *value = attr2->children;
                                    char *attrName = (char *)attr2->name;
                                    char *cont = (char *)(value->content);
                                    if(strcmp(attrName,"lat")==0){
                                            wroute->latitude = atof(cont);
                                       // printf("\n\nlat: %f\n", wroute->latitude);
                                    }if(strcmp(attrName,"lon")==0){
                                            wroute->longitude = atof(cont);
                                          //  printf("long: %f\n", wroute->longitude);
                                    }
                                    xmlNode * attr3;
                                    for (attr3 = attr->children; attr3 != NULL; attr3 = attr3->next){
                                        char* name1 = (char*)(attr3->name);
                                        if(strcmp(name1,"name")==0){
                                            free(wroute->name);
                                            wroute->name = malloc(strlen((char*)attr3->children->name)+15);
                                            strcpy(wroute->name,(char*)attr3->children->content);
                                        }
                                        else if(strcmp(name1,"name")!=0 &&strcmp(name1,"text")!=0)
                                        {
                                            char* desc =(char*)attr3->children->content;
                                            GPXData *data = malloc(sizeof(GPXData)+strlen(desc) +100);
                                            strcpy(data->name,name1);
                                            strcpy(data->value,desc);
                                            insertBack(wroute->otherData,data);
                                            //free(data);
                                        }
                                    }
                                }
                        insertBack(newrt->waypoints,wroute);
                    }else if (strcmp(attrName,"name")!=0 && strcmp(attrName,"text")!=0){
                        char *desc = (char*)attr->children->content;
                        GPXData * data = malloc(sizeof(GPXData)+ strlen(desc)+10000);
                        strcpy(data->name,attrName);
                        strcpy(data->value,desc);
                        insertBack(newrt->otherData,data);
                    }
            }
             insertBack(gpxdoc->routes,newrt);
        }if (strcmp(pointname,"trk")==0){
           Track* trk = malloc(sizeof(Track));
            trk->name = malloc(strlen((char*)children->children->content)+256);
            strcpy(trk->name,"");
            trk->segments =initializeList(&trackSegmentToString,&deleteTrackSegment,&compareTrackSegments);
            trk->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
            xmlNode *node1;
            for(node1 = children->children; node1!=NULL;node1=node1->next){
                char* nameAttr = (char*)(node1->name);
                if (strcmp(nameAttr,"name")==0){
                    free(trk->name);
                    trk->name=malloc(strlen((char*)node1->children->name)*100);
                    strcpy(trk->name,(char*)node1->children->content);
                }
                 else if (strcmp(nameAttr,"trkseg")==0){
                    TrackSegment * trkseg = malloc(sizeof(TrackSegment)*100);
                    trkseg->waypoints = initializeList(&waypointToString,&deleteWaypoint,&compareWaypoints);
                    xmlNode *node2;
                    for(node2 = node1->children;node2!=NULL;node2=node2->next){
                        char* nameAttr2 = (char*)(node2->name);
                        if(strcmp(nameAttr2,"trkpt")==0){
                           Waypoint *trksegway = malloc(sizeof(Waypoint)*100);
                           trksegway->name = malloc(1);
                           strcpy(trksegway->name,"");
                            trksegway->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
                           xmlAttr *att;
                        for(att= node2->properties;att != NULL; att=att->next){
 
                            xmlNode *value = att->children;
                            char *attrName = (char *)att->name;
                            char *cont = (char *)(value->content);
                            if(strcmp(attrName,"lat")==0){
                                    trksegway->latitude = atof(cont);
                            }else if(strcmp(attrName,"lon")==0){
                                    trksegway->longitude = atof(cont);
                             }
                        } 
                        xmlNode *node3;
                             for(node3 = node2->children; node3 != NULL; node3=node3->next){
                                 char* name1 = (char*)(node3->name);
                                    if(strcmp(name1,"name")==0){
                                        free(trksegway->name);
                                        trksegway->name = malloc(strlen((char*)node3->children->name)*1000);
                                        strcpy(trksegway->name, (char*)node3->children->content);
                                    }if (strcmp(name1,"name")!=0 && strcmp(name1,"text")!=0){
                                        char *desc = (char*)node3->children->content;
                                        GPXData * data = malloc(sizeof(GPXData)+ strlen(desc)+10000);
                                        strcpy(data->name,nameAttr);
                                        strcpy(data->value,desc);
                                        insertBack(trksegway->otherData,data);
                                    }
                                }
                          insertBack(trkseg->waypoints,trksegway);
                          }
                    }
                    insertBack(trk->segments,trkseg);
                }
                else if (strcmp(nameAttr,"name")!=0 &&(strcmp(nameAttr,"text")!=0)){
                        char *desc = (char*)node1->children->content;
                        GPXData * data = malloc(sizeof(GPXData)+ strlen(desc)+100000);
                        strcpy(data->name,nameAttr);
                        strcpy(data->value,desc);
                        insertBack(trk->otherData,data);
                    }
            }
            insertBack(gpxdoc->tracks,trk);
        }
    }
    xmlFreeDoc(doc);
    return gpxdoc;
}
 
GPXdoc* createValidGPXdoc(char* fileName, char* gpxSchemaFile){
    xmlDocPtr doc;
    xmlSchemaPtr schema = NULL;
    xmlSchemaParserCtxtPtr ctxt;
    char *XMLFileName = fileName;
    char *XSDFileName = gpxSchemaFile;
    GPXdoc * gpxdoc = NULL;
    xmlLineNumbersDefault(1);
 
    ctxt = xmlSchemaNewParserCtxt(XSDFileName);
 
    xmlSchemaSetParserErrors(ctxt, (xmlSchemaValidityErrorFunc) fprintf, (xmlSchemaValidityWarningFunc) fprintf, stderr);
    schema = xmlSchemaParse(ctxt);
    xmlSchemaFreeParserCtxt(ctxt);
    //xmlSchemaDump(stdout, schema); //To print schema dump
 
    doc = xmlReadFile(XMLFileName, NULL, 0);
 
    if (doc == NULL){
        //fprintf(stderr, "Could not parse %s\n", XMLFileName);
    }else{
        xmlSchemaValidCtxtPtr ctxt;
        int ret;
        ctxt = xmlSchemaNewValidCtxt(schema);
        xmlSchemaSetValidErrors(ctxt, (xmlSchemaValidityErrorFunc) fprintf, (xmlSchemaValidityWarningFunc) fprintf, stderr);
        ret = xmlSchemaValidateDoc(ctxt, doc);
    if (ret == 0){
     //printf("%s validates\n", XMLFileName);
     gpxdoc = createGPXdoc(fileName);
    }else if (ret > 0){
        printf("%s fails to validate\n", XMLFileName);
    }else{
        printf("%s validation generated an internal error\n", XMLFileName);
    }
        xmlSchemaFreeValidCtxt(ctxt);
        xmlFreeDoc(doc);
    }
 
    // free the resource
    if(schema != NULL){
        xmlSchemaFree(schema);
    }  
    xmlSchemaCleanupTypes();
    xmlCleanupParser();
    xmlMemoryDump();
    return gpxdoc;
}
 
xmlNode* gpxDataNode( GPXData *gpxd,xmlNs *namespace){
    xmlNode* node = xmlNewNode(NULL,BAD_CAST gpxd->name);
    xmlSetNs(node,namespace);
    xmlNode *name = xmlNewText(BAD_CAST gpxd->value);
    xmlAddChild(node,name);
    return node;
}

xmlNode* nameNode(char* name,xmlNs* ns){
   if(strlen(name)==0){
       return NULL;
   }else{
        xmlNode *n = xmlNewNode(NULL, BAD_CAST "name");
        xmlSetNs(n,ns);
        xmlNode *n2 = xmlNewText(BAD_CAST name);
        xmlAddChild(n,n2);
        return n;
   }
}
 
 
xmlNode* waypointNode(Waypoint *w,char* tag, xmlNs *namespace){
    xmlNode* node = xmlNewNode(NULL,BAD_CAST tag);
    xmlSetNs(node,namespace);
    xmlNode *name = nameNode(w->name,namespace);
   
    if(name != NULL){
        xmlAddChild(node,name);
    }
    char buf[150] = "\0";
    sprintf(buf,"%2.5f",w->latitude);
    xmlNewProp(node, BAD_CAST "lat", BAD_CAST buf);
    strcpy(buf,"\0");
    sprintf(buf,"%2.5f",w->longitude);
    xmlNewProp(node, BAD_CAST "lon", BAD_CAST buf);
    for(Node *node1 = w->otherData->head; node1!=NULL; node1=node1->next){
        GPXData *gpxd = (GPXData*)node1->data;
        xmlNode* nodechild = gpxDataNode(gpxd,namespace);
        xmlAddChild(node,nodechild);
    }
    return node;
}
 
 
xmlNode* segmentNode(TrackSegment *ts,xmlNs *namespace){
    xmlNode* node = xmlNewNode(NULL,BAD_CAST "trkseg");
    xmlSetNs(node,namespace);
    for(Node *node1 = ts->waypoints->head; node1!=NULL; node1=node1->next){
        Waypoint *w = (Waypoint*)node1->data;
        xmlNode* node1child = waypointNode(w,"trkpt",namespace);
        xmlAddChild(node,node1child);
    }
    return node;
}
 
xmlNode* trackNode(Track *t,xmlNs *namespace){
    xmlNode* node = xmlNewNode(NULL,BAD_CAST "trk");
    xmlSetNs(node,namespace);
    xmlNode *name = nameNode(t->name,namespace);
    if(name != NULL){
        xmlAddChild(node,name);
    }
    for(Node *node1 = t->otherData->head; node1!=NULL; node1=node1->next){
        GPXData *gpxd = (GPXData*)node1->data;
        xmlNode* nodechild = gpxDataNode(gpxd,namespace);
        xmlAddChild(node,nodechild);
    }
    for(Node *node1 = t->segments->head; node1 !=NULL; node1=node1->next){
        TrackSegment *trkseg = (TrackSegment*)node1->data;
        xmlNode* nodechild = segmentNode(trkseg,namespace);
        xmlAddChild(node,nodechild);
    }
    return node;
}
 
xmlNode* routeNode(Route *r,xmlNs *namespace){
    xmlNode* node = xmlNewNode(NULL,BAD_CAST "rte");
    xmlSetNs(node,namespace);
    xmlNode *name = nameNode(r->name,namespace);
    if(name != NULL){
        xmlAddChild(node,name);
    }
    for(Node *node1 = r->otherData->head; node1!=NULL; node1=node1->next){
        GPXData *gpxd = (GPXData*)node1->data;
        xmlNode* nodechild = gpxDataNode(gpxd,namespace);
        xmlAddChild(node,nodechild);
    }
    for(Node *node1 = r->waypoints->head; node1!=NULL; node1=node1->next){
        Waypoint *w = (Waypoint*)node1->data;
        xmlNode* node1child = waypointNode(w,"rtept",namespace);
        xmlAddChild(node,node1child);
    }
    return node;
}
 
xmlNode* gpxToNode(GPXdoc *doc){
    xmlNode* node = xmlNewNode(NULL,BAD_CAST "gpx");
     char buf[256];
     strcpy(buf,"\0");
     sprintf(buf,"%.1f",doc->version);
    xmlNewProp(node, BAD_CAST "version", BAD_CAST buf);
    xmlNewProp(node, BAD_CAST "creator", BAD_CAST doc->creator);
    xmlNs * namespace = xmlNewNs(node,BAD_CAST doc->namespace,NULL);
    xmlSetNs(node,namespace);
    if(doc->waypoints != NULL){
        for(Node *node1 = doc->waypoints->head; node1 != NULL;node1=node1->next){
            Waypoint *way = NULL;
            way = (Waypoint*)node1->data;
            xmlNode* node1child = waypointNode(way,"wpt",namespace);
            xmlAddChild(node,node1child);
        }
    }
     if(doc->routes != NULL){
        for(Node *node2 = doc->routes->head; node2 != NULL;node2=node2->next){
                Route *rt = NULL;
                rt =  (Route*)node2->data;
                xmlNode* node2child = routeNode(rt,namespace);
                xmlAddChild(node,node2child);
        }
     }
     if(doc->tracks != NULL){
         for(Node *node3 = doc->tracks->head; node3 != NULL;node3=node3->next){
        Track *trk = NULL;
        trk = (Track*)node3->data;
        xmlNode* node3child = trackNode(trk,namespace);
        xmlAddChild(node,node3child);
    }
     }
   
    return node;
}
 
bool writeGPXdoc(GPXdoc* doc, char* fileName){
    if(doc == NULL || fileName == NULL){
        return false;
    }
    xmlDoc* xmldoc = NULL;
    xmlNode* rootnode = NULL;
    rootnode = gpxToNode(doc);
    xmldoc = xmlNewDoc(BAD_CAST "1.0");
    xmlDocSetRootElement(xmldoc,rootnode);
    xmlSaveFormatFileEnc(fileName,xmldoc,"UTF-8",1);
    xmlFreeDoc(xmldoc);
    xmlCleanupParser();
    xmlMemoryDump();
    return true;
}
 
bool validateDoc(GPXdoc* doc){
    bool flag = true;
    if (doc==NULL){
        flag= false;
    }if(doc->creator == NULL || strlen(doc->creator)==0){
        flag =false;
    }if(strlen(doc->namespace)==0){
        flag = false;
    }if(doc->waypoints == NULL || (doc->routes == NULL)||(doc->tracks == NULL)){
        flag =false;
    }
    return flag;
}
 
bool validData(GPXData *gpx){
    if(gpx == NULL){
        return false;
    }if(strlen(gpx->name)==0 || strlen(gpx->value)==0){
        return false;
    }if(strcmp(gpx->name,"name")==0){
        return false;
    }
    return true;
}
 
bool validateWaypoints(Waypoint *w){
    if(w == NULL){
        return false;
    }if(w->name == NULL || w->otherData==NULL){
        return false;
    }if(w->latitude < -90 || w->latitude > 90){
        return false;
    }if(w->longitude < -180 || w->longitude > 180){
        return false;
    }
    for(Node *node1 = w->otherData->head; node1 != NULL; node1 = node1->next){
        GPXData* data = node1->data;
        if(validData(data)==false){
              return false;
        }
    }
    return true;
}
 
bool validateRoutes(Route *r){
    if(r == NULL){
        return false;
    }if(r->name == NULL ){
        return false;
    }if(r->waypoints == NULL ){
        return false;
    }if (r->otherData==NULL){
         return false;
    }
    for(Node *node1 = r->waypoints->head; node1 != NULL; node1 = node1->next){
        Waypoint* ts = node1->data;
        if(validateWaypoints(ts)==false){
              return false;
        }
    }for(Node *node1 = r->otherData->head; node1 != NULL; node1 = node1->next){
        GPXData* data = node1->data;
        if(validData(data)==false){
              return false;
        }
    }
    return true;
}
 
bool validateSegments(TrackSegment *s){
    if(s == NULL || s->waypoints==NULL){
        return false;
    }
    for(Node *node1 = s->waypoints->head; node1 != NULL; node1 = node1->next){
        Waypoint* w = node1->data;
        if(validateWaypoints(w)==false){
             return false;
        }
    }
    return true;
}
 
bool validateTracks(Track *t){
    if(t == NULL){
        return false;
    }if(t->name == NULL || t->segments == NULL || t->otherData==NULL){
        return false;
    }for(Node *node1 = t->otherData->head; node1 != NULL; node1 = node1->next){
        GPXData* data = node1->data;
        if(validData(data)==false){
              return false;
        }
    }for(Node *node1 = t->segments->head; node1 != NULL; node1 = node1->next){
        TrackSegment* ts = node1->data;
        if(validateSegments(ts)==false){
              return false;
        }
    }
    return true;
}
 
bool Validatedoc(GPXdoc *doc){
    if (doc==NULL){
        return false;
    }if(doc->creator == NULL || strlen(doc->creator)==0){
        return false;
    }if(strlen(doc->namespace)==0){
        return false;
    }if(doc->waypoints == NULL || (doc->routes == NULL)||(doc->tracks == NULL)){
        return false;
    }
    for(Node *node1 = doc->waypoints->head; node1 != NULL; node1 = node1->next){
        Waypoint* way = node1->data;
        if(validateWaypoints(way)==false){
             return false;
        }
    }for(Node *node1 = doc->routes->head; node1 != NULL; node1 = node1->next){
        Route* rt = NULL;
        rt = node1->data;
        if(validateRoutes(rt)==false){
             return false;
        }
    }for(Node *node1 = doc->tracks->head; node1 != NULL; node1 = node1->next){
        Track* trk = node1->data;
        if(validateTracks(trk)==false){
             return false;
        }
    }
    return true;
 
}
 
bool validateGPXDoc(GPXdoc* doc, char* gpxSchemaFile){
     if(doc == NULL || gpxSchemaFile == NULL){
        return false;    
    }
    bool flag = true; //validateDoc(doc);
    if (doc==NULL){
        flag = false;
    }if(doc->creator == NULL || strlen(doc->creator)==0){
        flag = false;
    }if(strlen(doc->namespace)==0){
        flag = false;
    }if(doc->waypoints == NULL || (doc->routes == NULL)||(doc->tracks == NULL)){
        flag = false;
    }
    for(Node *node1 = doc->waypoints->head; node1 != NULL; node1 = node1->next){
        Waypoint* way = node1->data;
        if(validateWaypoints(way)==false){
             flag = false;
        }
    }for(Node *node1 = doc->routes->head; node1 != NULL; node1 = node1->next){
        Route* rt = NULL;
        rt = node1->data;
        if(validateRoutes(rt)==false){
             flag = false;
        }
    }for(Node *node1 = doc->tracks->head; node1 != NULL; node1 = node1->next){
        Track* trk = node1->data;
        if(validateTracks(trk)==false){
             flag = false;
        }
    }
    if (flag ==false){
        return flag;
    }
 
    xmlDoc* xmldoc = NULL;       /* document pointer */
    xmlNode* root_node = NULL;
  
    xmldoc = xmlNewDoc(BAD_CAST "1.0");
    root_node = gpxToNode(doc);
    xmlDocSetRootElement(xmldoc, root_node);
    xmlSchemaParserCtxtPtr ctxt;
    xmlLineNumbersDefault(1);
    ctxt = xmlSchemaNewParserCtxt(gpxSchemaFile);
    xmlSchemaSetParserErrors(ctxt,(xmlSchemaValidityErrorFunc)fprintf,(xmlSchemaValidityWarningFunc)fprintf,stderr);
    xmlSchemaPtr sch = NULL;
    sch = xmlSchemaParse(ctxt);
    xmlSchemaFreeParserCtxt(ctxt);
    xmlSchemaValidCtxtPtr ctxt2;
    ctxt2 = xmlSchemaNewValidCtxt(sch);
    xmlSchemaSetValidErrors(ctxt2,(xmlSchemaValidityErrorFunc)fprintf,(xmlSchemaValidityWarningFunc)fprintf,stderr);
    int value =0;
    value = xmlSchemaValidateDoc(ctxt2,xmldoc);
    if(value == 0){
        flag = true;
    }
    xmlSchemaFreeValidCtxt(ctxt2);
    xmlFreeDoc(xmldoc);
    if(sch != NULL){
        xmlSchemaFree(sch);
    }
    xmlSchemaCleanupTypes();
    xmlCleanupParser();
    /*
     * this is to debug memory for regression tests
     */
    xmlMemoryDump();
    return flag;
}
 

bool validateGPXFile(char * filename, char * schemafile){
    if(filename == NULL || schemafile == NULL){
        return false;
    }
    GPXdoc * doc = createValidGPXdoc(filename,schemafile);
    if(doc == NULL){
        return false;
    }
    return validateGPXDoc(doc,schemafile);
}

float round10(float len){
    if(len < 0){
        return 0;
    }
    int x = (len+5)/10;
    x = x*10;
    //printf("%d",x); 
    return x;
}
 


float calcDistance(float lat1, float lat2, float lon1, float lon2){
     float R = 6371000;
     float phi1 = lat1 * M_PI/180;
     float phi2 = lat2 * M_PI/180;
     float deltaphi = (lat2-lat1) * M_PI/180;
     float deltalambda = (lon2 - lon1) * M_PI/180;
     float a = sin(deltaphi/2) * sin(deltaphi/2) + cos(phi1) * cos(phi2) * sin(deltalambda/2) * sin(deltalambda/2);
     float c = 2 * atan2(sqrt(a),sqrt(1-a));
     float d = R*c;
     return d;
}


float getRouteLen(const Route *rt){
    if(rt == NULL){
        return 0;
    }else{
        float length=0;
        if(getLength(rt->waypoints)==0){
            return 0;
        }
        for(Node *node = rt->waypoints->head; node->next !=NULL;node=node->next){
            Waypoint* way = node->data;
            Waypoint* way2 = node->next->data;
            float lat1 = way->latitude;
            float lat2= way2->latitude;
            float lon1 = way->longitude;
            float lon2= way2->longitude;
          //  length += calcDistance(way,way2);
            length += calcDistance(lat1, lat2,lon1,lon2);
        }
        return length;
    }
}


float getTrackLen(const Track *tr){
    if(tr == NULL){
        return 0;
    }
    float total =0;
     if(getLength(tr->segments)==0){
            return 0;
        }
    List *waypoints2 = initializeList(&waypointToString,&deleteDummy,&compareWaypoints);
    for(Node* node = tr->segments->head; node != NULL; node=node->next){
        TrackSegment* ts = node->data;
        for(Node* node2 = ts->waypoints->head; node2!=NULL;node2=node2->next){
            insertBack(waypoints2,node2->data);
        }
    }for(Node * wnode = waypoints2->head; wnode->next !=NULL; wnode=wnode->next){
        Waypoint* way = wnode->data;
        Waypoint* way2 = wnode->next->data;
        float lat1 = way->latitude;
        float lat2= way2->latitude;
            float lon1 = way->longitude;
            float lon2= way2->longitude;
            total += calcDistance(lat1, lat2,lon1,lon2);
    }
    freeList(waypoints2);
    return total;
}
 
int numRoutesWithLength(const GPXdoc* doc, float len, float delta){
        if(doc == NULL || len < 0 || delta < 0){
            return 0;
        }else{
            int num = 0;
            for(Node *node = doc->routes->head;node !=NULL;node=node->next){
                Route *r = node->data;
                if(fabs(getRouteLen(r) - len) <= delta){
                    num++;
                }
            }
            return num;
        }
}
 
 
int numTracksWithLength(const GPXdoc* doc, float len, float delta){
    if(doc == NULL || len < 0 || delta < 0){
        return 0;
    }else{
        int num = 0;
        for(Node *node = doc->tracks->head;node !=NULL;node=node->next){
            Track *r = node->data;
            if(fabs(getTrackLen(r) - len) <= delta){
                num++;
            }
        }
        return num;
    }
}


bool isLoopRoute(const Route* route, float delta){
        if(route == NULL || delta < 0){
            return false;
        }else{
            if(getLength(route->waypoints) < 4){
                return false;
            }else{
                float total = 0;
                Node *node = route->waypoints->head;
                Node *node2 = route->waypoints->tail;
                
                Waypoint* way = node->data;
                Waypoint* way2 = node2->data;
                float lat1 = way->latitude;
                float lat2= way2->latitude;
                float lon1 = way->longitude;
                float lon2= way2->longitude;
                total += calcDistance(lat1, lat2,lon1,lon2);
               // printf("test tot:%f \n",total);
                if(total <= delta){
                    return true;
                }
            }
        }
        return false;
}
 

bool isLoopTrack(const Track *tr, float delta){
        if(tr == NULL || delta < 0){
            return false;
        }
        if(getLength(tr->segments)==0){
            return false;
        }
        int num =0;
        for(Node *node = tr->segments->head; node!=NULL;node=node->next){
            TrackSegment *segs = node->data;
            num += getLength(segs->waypoints);
        }
        if(num < 4){
            return false;
        }
        float total = 0;
        TrackSegment * ts1 = tr->segments->head->data;
        TrackSegment * ts2 = tr->segments->tail->data;
        Waypoint * w1 =ts1->waypoints->head->data;
        Waypoint * w2 = ts2->waypoints->tail->data;
        float lat1 = w1->latitude;
        float lat2= w2->latitude;
        float lon1 = w1->longitude;
        float lon2= w2->longitude;
        total += calcDistance(lat1, lat2,lon1,lon2);
        if(total <= delta){
            return true;
        }else{
            return false;
        }
}
 
List* getRoutesBetween(const GPXdoc* doc, float sourceLat, float sourceLong, float destLat, float destLong, float delta){
    if(doc == NULL){
        return NULL;
    }
    List * rlist= initializeList(&routeToString,&deleteDummy,&compareRoutes);
    for(Node *node = doc->routes->head; node!= NULL;node=node->next){
        Route * r = node->data;
        if(getLength(r->waypoints)<=0){
            freeList(rlist);
            return NULL;
        }
        Waypoint *w1 = r->waypoints->head->data;
        Waypoint *w2 = r->waypoints->tail->data;

        float d1 = 0;
        d1 = calcDistance( sourceLat,w1->latitude, sourceLong,w1->longitude);
        float d2=0;
        d2 = calcDistance(w2->latitude,destLat,w2->longitude, destLong);
        if(d1 <= delta && d2 <= delta){
            insertBack(rlist,r);
        }
    }
    if(getLength(rlist)==0){
        freeList(rlist);
        return NULL;
    }else{
        return rlist;
    }
}

List* getTracksBetween(const GPXdoc* doc, float sourceLat, float sourceLong, float destLat, float destLong, float delta){
   if(doc == NULL){
       return NULL;
   }
   List *tracks = initializeList(&trackToString,&deleteDummy,&compareTracks);

   for(Node *node = doc->tracks->head; node != NULL; node=node->next){
       Track * t = node->data;
        if(getLength(t->segments) <= 0){ 
          //  free(ts1);
           // free(ts2);
          // free(t->segments);
            freeList(tracks);
            return NULL;
        }
       TrackSegment *ts1 = t->segments->head->data;
       TrackSegment *ts2 = t->segments->tail->data;
      
       Waypoint * w1 = getFromFront(ts1->waypoints);
       Waypoint * w2 = getFromBack(ts2->waypoints);
       float d1 = 0;
        d1 = calcDistance(w1->latitude, sourceLat,w1->longitude, sourceLong);
        float d2=0;
        d2 = calcDistance(w2->latitude,destLat,w2->longitude, destLong);
        if(d1 <= delta && d2 <= delta){
            insertBack(tracks,t);
        }
   }
   if(getLength(tracks)==0){
        freeList(tracks);
        return NULL;
    }else{
        return tracks;
    }
}
 

char* trackToJSON(const Track *tr){
    char * json = calloc(1000,sizeof(char));
    if(tr == NULL){
        strcpy(json,"{}");
        return json;
    }
    char *namestr = calloc(256,sizeof(char));
    char *loopstr = calloc(256,sizeof(char));
    if(strlen(tr->name)==0){
        strcpy(namestr,"None");
    }else{
        strcpy(namestr,tr->name);
    }
    if (isLoopTrack(tr,10)==true){
        strcpy(loopstr,"true");
    }else{
        strcpy(loopstr,"false");
    }
    sprintf(json,"{\"name\":\"%s\",\"len\":%.1f,\"loop\":%s}",namestr,round10(getTrackLen(tr)),loopstr);
    free(namestr);
    free(loopstr);
    return json;
}
 

char* routeToJSON(const Route *rt){
    char * json = calloc(1000,sizeof(char));
    if(rt == NULL){
        strcpy(json,"{}");
        return json;
    }
    char *namestr = calloc(2560,sizeof(char)+100);
    char *loopstr = calloc(2560,sizeof(char)+100);
    if(strlen(rt->name)==0){
        strcpy(namestr,"None");
    }else{
        strcpy(namestr,rt->name);
    }
    if (isLoopRoute(rt,10)==true){
        strcpy(loopstr,"true");
    }else{
        strcpy(loopstr,"false");
    }
    sprintf(json,"{\"name\":\"%s\",\"numPoints\":%d,\"len\":%.1f,\"loop\":%s}",namestr,getLength(rt->waypoints),round10(getRouteLen(rt)),loopstr);
    free(namestr);
    free(loopstr);
    return json;
}
 

char* routeListToJSON(const List *list){
    char * json = calloc(1000,sizeof(char));
    int memsize = 1000;
    if(list == NULL){
        strcpy(json,"[]");
        return json;
    }
    strcat(json,"[");
    for(Node* node = list->head; node != NULL; node=node->next){
        Route *route = node->data;
        char * temp = routeToJSON(route);
        memsize += strlen(temp)+10;
        json = realloc(json,memsize*sizeof(char));
        strcat(json,temp);
        free(temp);   
        if(node->next != NULL){
            strcat(json,",");
        }
    }
    strcat(json,"]");
    return json;
}
 
char* trackListToJSON(const List *list){
   char * json = calloc(1000,sizeof(char));
    int memsize = 1000;
    if(list == NULL){
        strcpy(json,"[]");
        return json;
    }
    strcat(json,"[");
    for(Node* node = list->head; node != NULL; node=node->next){
        Track *route = node->data;
        char * temp = trackToJSON(route);
        memsize += strlen(temp)+10;
        json = realloc(json,memsize*sizeof(char));
        strcat(json,temp);
        free(temp);   
        if(node->next != NULL){
            strcat(json,",");
        }
    }
    strcat(json,"]");
    return json;
}
 

char* GPXfiletoJSON(char* filename){
    char * json = calloc(1000,sizeof(char));
    if(filename == NULL){
        strcpy(json,"{}");
        return json;
    }
    GPXdoc* gpx = createGPXdoc(filename);
    if(gpx ==NULL){
        strcpy(json,"{}");
        return json;
    }
    sprintf(json,"{\"fileName\":\"%s\",\"version\":%.1f,\"creator\":\"%s\",\"numWaypoints\":%d,\"numRoutes\":%d,\"numTracks\":%d}",filename,gpx->version,gpx->creator,getNumWaypoints(gpx),getNumRoutes(gpx),getNumTracks(gpx));
    return json;
}

char* GPXtoJSON(const GPXdoc* gpx){
    char * json = calloc(1000,sizeof(char));
    if(gpx == NULL){
        strcpy(json,"{}");
        return json;
    }
    sprintf(json,"{\"version\":%.1f,\"creator\":\"%s\",\"numWaypoints\":%d,\"numRoutes\":%d,\"numTracks\":%d}",gpx->version,gpx->creator,getNumWaypoints(gpx),getNumRoutes(gpx),getNumTracks(gpx));
    return json;
}
 
 
 
// ***************************** Bonus A2 functions ********************************

void addWaypoint(Route *rt, Waypoint *pt){
    if(rt == NULL || pt == NULL){
        return;
    }
    insertBack(rt->waypoints,pt);
      return;
}
 
void addRoute(GPXdoc* doc, Route* rt){
 if(doc == NULL || rt == NULL){
     return;
 }
 insertBack(doc->routes,rt);
   return;
}

int findTolk(char *str, char c){
    for(int i =0; i < strlen(str); i++){
        if(str[i] == c){
            return i;
        }
    }
    return -1;
}

 
GPXdoc* JSONtoGPX(const char* gpxString){
    if(gpxString == NULL){
        return NULL;
    }
    GPXdoc * doc = malloc(sizeof(GPXdoc));
    doc->waypoints = initializeList(&waypointToString,&deleteDummy,&compareWaypoints);
    doc->routes = initializeList(&routeToString,&deleteDummy,&compareRoutes);
    doc->tracks = initializeList(&trackToString,&deleteDummy,&compareTracks);
    strcpy(doc->namespace,"http://www.topografix.com/GPX/1/1");
     char* tempgpx = (char*)gpxString;
    //char c = '';
    int comma = -1; //= findTolk(tempgpx,',');
    char c = ',';
    for(int i =0; i < strlen(tempgpx); i++){
        if(tempgpx[i] == c){
            comma =  i;
        }
    }
    char *array1 = strSplit(tempgpx,2,comma);
    char *array2 = strSplit(tempgpx,comma+1,strlen(tempgpx)-1);
    int colon = 0; //findTolk(array1,':');
    c = ':';
    for(int j =0; j < strlen(array1); j++){
        if(array1[j] == c){
            colon =  j;
        }
    }
    char* latVal = strSplit(array1,colon+1,strlen(array1));
    colon = findTolk(array2,':');
    char* lonVal = strSplit(array2,colon+1,strlen(array2));
    //strtok(lonVal,"\"");

    char *nameval = malloc(5000);
   // int colon = 0; 
    c = '"';
    int k=0;
    for(int j =0; j < strlen(lonVal); j++){
        if(lonVal[j] != c){
            nameval[k] =  lonVal[j];
            k++;
        }
    }
    nameval[k] = '\0';

    doc->creator=nameval;
  //  printf("%s\n",lonVal2);
    free(array1);
    free(array2);
   // Waypoint * w =  malloc(sizeof(Waypoint));
    //doc->creator = lonVal2;
    doc->version = atof(latVal);
  //  printf("creator:%s|\n",doc->creator);
  //  printf("version:%.1f|\n",doc->version);
    free(latVal);
    free(lonVal);
    //free(lonVal2);
    return doc;
}
 
Waypoint* JSONtoWaypoint(const char* gpxString){
    if(gpxString == NULL){
        return NULL;
    }
    char* tempgpx = (char*)gpxString;
    //char c = '';
   // printf("way: %s\n",tempgpx);
    int comma = -1; //= findTolk(tempgpx,',');
    char c = ',';
    for(int i =0; i < strlen(tempgpx); i++){
        if(tempgpx[i] == c){
            comma =  i;
        }
    }
    char *array1 = strSplit(tempgpx,2,comma);
    char *array2 = strSplit(tempgpx,comma+1,strlen(tempgpx)-1);
    int colon = 0; //findTolk(array1,':');
    c = ':';
    for(int j =0; j < strlen(array1); j++){
        if(array1[j] == c){
            colon =  j;
        }
    }
    char* latVal = strSplit(array1,colon+1,strlen(array1));
    colon = findTolk(array2,':');
    char* lonVal = strSplit(array2,colon+1,strlen(array2));
    free(array1);
    free(array2);
    Waypoint * w =  malloc(sizeof(Waypoint));
    w->otherData = initializeList(&gpxDataToString,&deleteDummy,&compareGpxData);
    w->name = malloc(265);
    strcpy(w->name,"");
    w->latitude = atof(latVal);
    w->longitude = atof(lonVal);
   // printf("lat: %f\n",w->latitude);
   // printf("lon: %f\n",w->longitude);
    free(latVal);
    free(lonVal);
    return w;
}
 


Route* JSONtoRoute(const char* gpxString){
  if(gpxString == NULL){
        return NULL;
    }
    char* tempgpx = (char*)gpxString;
    //char c = '';
    int comma = -1; 
    char c = ':';
    for(int i =0; i < strlen(tempgpx); i++){
        if(tempgpx[i] == c){
            comma =  i;
        }
    }
    char *name = strSplit(tempgpx,2,comma);
    char *array2 = strSplit(tempgpx,comma+1,strlen(tempgpx)-1);
    char nameval[500];
   // int colon = 0; 
    c = '"';
    int k=0;
    for(int j =0; j < strlen(array2); j++){
        if(array2[j] != c){
            nameval[k] =  array2[j];
            k++;
        }
    }
    nameval[k] = '\0';
    Route * w =  malloc(sizeof(Route));
    w->waypoints = initializeList(&waypointToString,&deleteDummy,&compareWaypoints);
    w->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
    w->name = malloc(265);
    strcpy(w->name,nameval);
   // w->longitude = atof(lonVal);
   // printf("name|: %s\n",w->name);
   // printf("lon: %f\n",w->longitude);
    free(name);
    free(array2);
   return w;
}


/**************************Assignment 3******************************/
char *routeCompToJSON(int num,Route* rt){
 char * json = calloc(1000,sizeof(char));
    if(rt == NULL){
        strcpy(json,"{}");
        return json;
    }

    char *namestr = calloc(2560,sizeof(char)+100);
    char *loopstr = calloc(2560,sizeof(char)+100);
    if(strlen(rt->name)==0){
        strcpy(namestr,"None");
    }else{
        strcpy(namestr,rt->name);
    }
    if (isLoopRoute(rt,10)==true){
        strcpy(loopstr,"true");
    }else{
        strcpy(loopstr,"false");
    }
    char array[100];
    sprintf(array,"Route %d", num);
    sprintf(json,"{\"compnum\":\"%s\",\"name\":\"%s\",\"numPoints\":%d,\"len\":%.1f,\"loop\":%s}",array,namestr,getLength(rt->waypoints),round10(getRouteLen(rt)),loopstr);
    free(namestr);
    free(loopstr);
    return json;
}

char *trackCompToJSON(int num,Track* rt){
 char * json = calloc(1000,sizeof(char));
    if(rt == NULL){
        strcpy(json,"{}");
        return json;
    }

    char *namestr = calloc(2560,sizeof(char)+100);
    char *loopstr = calloc(2560,sizeof(char)+100);
    if(strlen(rt->name)==0){
        strcpy(namestr,"None");
    }else{
        strcpy(namestr,rt->name);
    }
    if (isLoopTrack(rt,10)==true){
        strcpy(loopstr,"true");
    }else{
        strcpy(loopstr,"false");
    }
    char array[100];
    int x = 0;
    for(Node * node = rt->segments->head;node !=NULL;node=node->next){
        TrackSegment * temp = node->data;
        x+=getLength(temp->waypoints);
    }
    sprintf(array,"Track %d", num);
    sprintf(json,"{\"compnum\":\"%s\",\"name\":\"%s\",\"numPoints\":%d,\"len\":%.1f,\"loop\":%s}",array,namestr,x,round10(getTrackLen(rt)),loopstr);
    free(namestr);
    free(loopstr);
    return json;
}

char *GPXfileDetailstoJSON( char *filename){
    GPXdoc *doc =createGPXdoc(filename);
    int memsize = 1000;
    int flag=0;
    char *json = calloc(memsize,sizeof(char));
    strcat(json,"[");
    int counter = 1;
    for(Node *node = doc->routes->head; node != NULL; node=node->next){
        char *temp = routeCompToJSON(counter,node->data);
        memsize += strlen(temp);
        json = realloc(json,memsize*sizeof(char));
        strcat(json,temp);
        free(temp);
        if(node->next != NULL){
            strcat(json,",");
        }
        counter++;
        flag=1;
    }
    counter = 1;
    if(getLength(doc->tracks) == 0){
        strcat(json,"]");
        return json;
    }
    if(flag==1){
         strcat(json,",");
    }
     for(Node *node = doc->tracks->head; node != NULL; node=node->next){
        char *temp = trackCompToJSON(counter,node->data);
        memsize += strlen(temp);
        json = realloc(json,memsize*sizeof(char));
        strcat(json,temp);
        free(temp);
        if(node->next != NULL){
            strcat(json,",");
        }
        counter++;
    }
    strcat(json,"]");
    return json;
}

char *GPXdataToJSON(GPXData * rt){
 char * json = calloc(1000,sizeof(char));
    if(rt == NULL){
        strcpy(json,"{}");
        return json;
    }

    char *namestr = calloc(2560,sizeof(char)+100);
    char *valstr = calloc(2560,sizeof(char)+100);
    if(strcmp(rt->name,"None")==0){
        strcpy(namestr,"None");
         strcpy(valstr,"None");
    }else{
        strcpy(namestr,rt->name);
         strcpy(valstr,rt->value);
    }
  /* if(rt->value==NULL){
        strcpy(valstr,"None");
    }else{
        strcpy(valstr,rt->value);
    }*/
    sprintf(json,"{\"name\":\"%s\",\"value\":\"%s\"}",namestr,valstr);
    free(namestr);
    free(valstr);
    return json;
}


char * gpxDataToJSON(char *filename, char *name){
    GPXdoc *doc =createGPXdoc(filename);
     int memsize = 1000;
   // int flag=0;
    char *json = calloc(memsize,sizeof(char));
  //  strcat(json,"[");
   // int counter = 1;
    Route *r = getRoute(doc,name);
    for(Node *node = r->otherData->head;node != NULL;node=node->next){
      GPXData *temp = node->data;
      char *name = temp->name;
      char *value = temp->value;
      memsize += strlen(name) + strlen(value);
      json = realloc(json,memsize*sizeof(char));
      strcat(json,GPXdataToJSON(temp));
        if(node->next != NULL){
            strcat(json,",");
        }
    }
   // strcat(json,"]");
    return json;
}

char * gpxDataToJSONTracks(char *filename, char *name){
    GPXdoc *doc =createGPXdoc(filename);
     int memsize = 1000;
   // int flag=0;
    char *json = calloc(memsize,sizeof(char));
  //  strcat(json,"[");
    int counter = 0;
    Track *r = getTrack(doc,name);
    for(Node *node = r->otherData->head;node != NULL;node=node->next){
      GPXData *temp = node->data;
      char *name = temp->name;
      char *value = temp->value;
      strtok(value,"\n\t");
      memsize += strlen(name) + strlen(value);
      json = realloc(json,memsize*sizeof(char));
      strcat(json,GPXdataToJSON(temp));
        if(node->next != NULL){
            strcat(json,",");
        }
    counter =1;
    }
    if(counter ==1){
        strcat(json,"|");
    }
   
    for(Node *n = r->segments->head;n != NULL;n=n->next){
        TrackSegment *ts = n->data;
        for(Node * n2 = ts->waypoints->head; n2 != NULL; n2= n2->next){
            Waypoint * w = n2->data;
            for(Node * n3 = w->otherData->head; n3 != NULL; n3=n3->next){
                GPXData * temp2 = n3->data;
                char *name2 = temp2->name;
                char *value2 = temp2->value;
                strtok(value2,"\n\t");
                memsize += strlen(name2) + strlen(value2);
                json = realloc(json,memsize*sizeof(char));
                strcat(json,GPXdataToJSON(temp2));
                if(n3->next != NULL){
                    strcat(json,",");
                }
                strcat(json,"|");
            }
        }
    }
   // strcat(json,"]");
    return json;
}

bool renameRoute(char * filename, char* old ,char*new,char*schemafile){
     GPXdoc *doc =createGPXdoc(filename);
     if(doc == NULL){
        return false;
    }
    int flag =0;
    // doc->routes = getRoute(doc,old);
     //strcpy(doc->routes->name,new);
   //  printf("rrrname  %s\n",r->name);
     for(Node*node = doc->routes->head;node!=NULL;node=node->next){
         Route *r = node->data;
         if(strcmp(r->name,old)==0){
            strcpy(r->name,new);
            flag =1;
         }
         
        // strcpy(r->name,new);
        // printf("rrrname  %s\n",node->data);
        
     }
     
     for(Node*node = doc->tracks->head;node!=NULL;node=node->next){
         Track *t = node->data;
         if(strcmp(t->name,old)==0){
            strcpy(t->name,new);
            flag =1;
            printf("rrrname  %s\n",t->name);
         }
        // strcpy(r->name,new);
        // printf("rrrname  %s\n",node->data);
     }
     if (flag ==1){
        remove(filename);
        writeGPXdoc(doc,filename);
     }
   
     return validateGPXDoc(doc,schemafile);
}

bool createNewFile(char *filename){
   // GPXdoc * doc = createValidGPXdoc(filename,schemafile);
    GPXdoc * doc = JSONtoGPX("{\"version\":1.1,\"creator\":\"GPS Data Viewer\"}");
   if(writeGPXdoc(doc,filename)==true){
       return true;
   }
    return false;
}

char * routeDataToJSON(char *file,  float sourceLat, float sourceLong, float destLat, float destLong, float delta){
   //  printf("hereeee");
 /*   GPXdoc *doc = createGPXdoc(file);
      printf("here2");
    List * routes = getRoutesBetween(doc,sourceLat,sourceLong,destLat,destLong,delta);
      printf("here3");
      
    List * tracks = getTracksBetween(doc,sourceLat,sourceLong,destLat,destLong,delta);
    int memsize = 1000;
    int flag=0;
    char *json = calloc(memsize,sizeof(char));
    strcat(json,"[");
    int counter = 1;
    printf("here");
    for(Node *node = routes->head; node != NULL; node=node->next){
        //char *temp = routeCompToJSON(counter,node->data);
        Route * temp = node->data;
       printf("%s\n",temp->name);
        memsize += strlen(temp);
        json = realloc(json,memsize*sizeof(char));
        strcat(json,temp);
        free(temp);
        if(node->next != NULL){
            strcat(json,",");
        }
        counter++;
        flag=1;
        printf("json %s\n",temp->name);
    }
    printf("yo");
    counter = 1;
    if(getLength(doc->tracks) == 0){
        strcat(json,"]");
        return json;
    }
    if(flag==1){
         strcat(json,",");
    }
     for(Node *node = tracks->head; node != NULL; node=node->next){
        char *temp = trackCompToJSON(counter,node->data);
        memsize += strlen(temp);
        json = realloc(json,memsize*sizeof(char));
        strcat(json,temp);
        free(temp);
        if(node->next != NULL){
            strcat(json,",");
        }
        counter++;
        printf("json %s\n",json);
    }
    strcat(json,"]");
    printf("json %s\n",json);
    //printf("%s\n",routejson);*/
    return NULL;
}

char *createNewRoute(char*latlon,char*routename,char *filename,int length){
    GPXdoc * doc = createGPXdoc(filename);
    //GPXdocToString(doc); 
    int newlen = length;
    Route * r = malloc(sizeof(Route));
    char newjson[10000];
    for(int j=0;j<strlen(latlon);j++){
        newjson[j] = latlon[j];
    }
    r = JSONtoRoute(routename);
    r->waypoints =initializeList(&waypointToString,&deleteWaypoint,&compareWaypoints);
    r->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
    char *tolk = strtok(newjson,"|");
    char *array[newlen];
    int h=0;
    while(tolk !=NULL){
        array[h++] = tolk;
        tolk = strtok(NULL,"|");
    }
    
   // printf("len: %d\n",newlen);
    for(int i =0; i<newlen;i++){
       Waypoint * w = JSONtoWaypoint(array[i]);
       //printf("yoyoyo %f\n",w->latitude);
       addWaypoint(r,w);
    }
  
    addRoute(doc,r);
   // insertBack(doc->routes,r);
   
    //GPXdocToString(doc); 
    remove(filename);
   // printf("hiiiii\n");
    writeGPXdoc(doc,filename);
    return filename;
}