#include <stdio.h>
#include <libxml/parser.h>
#include <libxml/tree.h>
#include "GPXParser.h"
 
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
         Route * r = (Route*) h->data;
         num = num + getLength(r->otherData);
         
         if(strcmp(r->name,"")!=0){
             num+=1;
         }
         Node* h2;
         for(h2=r->waypoints->head;h2!=NULL;h2 = h2->next){
              Waypoint *w2 = (Waypoint*)h2->data;
             num = num + getLength(w2->otherData);
            
             if(strcmp(w2->name,"")!=0){
                num+=1;
            }
         }

     }
      Node* h3;
     for(h3=doc->tracks->head;h3!=NULL;h3 = h3->next){
         Track * t = h3->data;
         num = num + getLength(t->otherData);
         if(strcmp(t->name,"")!=0){
             num+=1;
         }
         Node* h4;
         for(h4=t->segments->head;h4!=NULL;h4 = h4->next){
              Waypoint *w3 = (Waypoint*)h4->data;
             num = num + getLength(w3->otherData);
             if(strcmp(w3->name,"")!=0){
                num+=1;
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
    }
  
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

char* waypointToString(void *data){
    if(data==NULL){
        return NULL;
    }
    Waypoint *wpttemp =(Waypoint*)data;
    //char *wptsdata = toString(wpttemp->otherData);
    char *buffer = calloc(1000,sizeof(char));
    sprintf(buffer,"Waypoints: name: %s long: %f lat %f \n",wpttemp->name,wpttemp->longitude,wpttemp->latitude);
 //   free(wptsdata);
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
    if(i<0|| i>strlen(string)|| (e<0 )|| (e>strlen(string)) || (i>e)){
        return NULL;
    }
    char* string1 = calloc((e-i)+10,sizeof(char));
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
    int breakflag = 0;
    for (i = wps->children; (i != NULL)||(breakflag==0); i = i->next){
        char *name = (char*)i->name;
        if(strcmp(name,"name")==0){
            node = i->children;
            breakflag =1;
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
  //  Waypoint * newwpt;
    double latitude = 0.0;
    double longitude = 0.0;
    xmlAttr *attr;
  // printf("1\n");
    for (attr = wps->properties; attr != NULL; attr = attr->next){
        xmlNode *value = attr->children;
        char *attrName = (char *)attr->name;
        char *cont = (char *)(value->content);
        if(strcmp(attrName,"lat")==0){
             // printf("2\n");
                latitude = atof(cont);
               // printf("\n\n\n\nlat: %f\n\n\n\n",latitude);
        }if(strcmp(attrName,"lon")==0){
            //  printf("3\n");
                longitude = atof(cont);
               // printf("\n\n\n\nlong: %f\n\n\n\n",longitude);
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
            insertFront(new->otherData,gpxd);
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
    Route * newrt;
    //Track * trk;
    for (children = root_element->children; children != NULL; children = children->next){
        char* pointname = (char*)children->name;
        if (strcmp(pointname,"wpt")==0){
                waypts = makeNewWaypoint(children);
                insertFront(gpxdoc->waypoints,waypts);
        }if (strcmp(pointname,"rte")==0){
                    // rtepts = makeNewRoute(children);
                    newrt = malloc(sizeof(Route));
                    newrt->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
                    newrt->waypoints = initializeList(&waypointToString,&deleteWaypoint,&compareWaypoints);
                    xmlNode *attr;
                   // printf(" pointname: %s tesssst\n",pointname);
                    for (attr = children->children; attr != NULL; attr = attr->next){
                     //   xmlNode *value = attr->children;
                    // printf("tesssst22222222\n");
                        char * attrName = (char*)(attr->name);
                        if(strcmp(attrName,"name")==0){
                         //   printf("name test\n");
                            newrt->name = malloc(strlen((char*)attr->children->name)+15);
                            strcpy(newrt->name,(char*)attr->children->content);
                        }else if(strcmp(attrName,"rtept")==0){
                            xmlAttr *attr2;
                             Waypoint *wroute = malloc(sizeof(Waypoint));
                             wroute->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
                             wroute->name = malloc(1);
                             strcpy(wroute->name,"");
                            // printf("tesssst4444\n");
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
                                     //   printf("tesssst1\n");
                                       // char * wptname = (char*)attr3->name;
                                        char* name1 = (char*)(attr3->name);
                                        if(strcmp(name1,"name")==0){
                                            
                                           // printf("in n ame 2\n");
                                        // GPXData * gpxd = setGPX(attr3);
                                            //insertBack(newrt->otherData,gpxd);
                                            free(wroute->name);
                                            wroute->name = malloc(strlen((char*)attr3->children->name)+15);
                                            strcpy(wroute->name,(char*)attr3->children->content);
                                        }
                                        else if(strcmp(name1,"text")!=0)
                                        {
                                            char* desc =(char*)attr3->children->content;
                                            GPXData *data = malloc(sizeof(GPXData)+strlen(desc) +100);
                                            strcpy(data->name,name1);
                                            strcpy(data->value,desc);
                                            insertFront(wroute->otherData,data);
                                            free(data);
                                        }
                                    }
                                }
                        insertFront(newrt->waypoints,wroute);
                    }else if (strcmp(attrName,"text")!=0){
                        //printf("in not text\n");
                        char *desc = (char*)attr->children->content;
                        GPXData * data = malloc(sizeof(GPXData)+ strlen(desc)+15);
                        strcpy(data->name,attrName);
                        strcpy(data->value,desc);
                      //  newrt->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
                        insertFront(newrt->otherData,data);
                    }
            }
             insertFront(gpxdoc->routes,newrt);
        }if (strcmp(pointname,"trk")==0){
           Track* trk = malloc(sizeof(Track));
            trk->segments =initializeList(&trackSegmentToString,&deleteTrackSegment,&compareTrackSegments);
            trk->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
            xmlNode *node1;
            for(node1 = children->children; node1!=NULL;node1=node1->next){
                char* nameAttr = (char*)(node1->name);
      //  printf(" nameeee: %s in here\n",nameAttr);
                if (strcmp(nameAttr,"name")==0){
                    trk->name=malloc(strlen((char*)node1->children->name)*100);
                    strcpy(trk->name,(char*)node1->children->content);
                }
                 else if (strcmp(nameAttr,"trkseg")==0){
                // printf("in here track seg\n");
                    TrackSegment * trkseg = malloc(sizeof(TrackSegment));
                    trkseg->waypoints = initializeList(&waypointToString,&deleteWaypoint,&compareWaypoints);
               
                   // Waypoint *trksegway = malloc(sizeof(Waypoint)*10000);
                   // trksegway = trkseg->waypoints;
                    xmlNode *node2;
                    for(node2 = node1->children;node2!=NULL;node2=node2->next){
                        
                         //Waypoint *trksegway = malloc(sizeof(Waypoint)*100);
                       //  printf("in here track seg way\n");
                        char* nameAttr2 = (char*)(node2->name);
                        if(strcmp(nameAttr2,"trkpt")==0){
                           Waypoint *trksegway = malloc(sizeof(Waypoint));
                           trksegway->otherData = initializeList(&gpxDataToString,&deleteGpxData,&compareGpxData);
                           trksegway->name = malloc(1);
                           strcpy(trksegway->name,"");
                           xmlAttr *att;
                        for(att= node2->properties;att != NULL; att=att->next){
                            xmlNode *value = att->children;
                            char *attrName = (char *)att->name;
                            char *cont = (char *)(value->content);
                            if(strcmp(attrName,"lat")==0){
                                    trksegway->latitude = atof(cont);
                                //  printf("\n\nlat: %f\n", trksegway->latitude);
                            }else if(strcmp(attrName,"lon")==0){
                                    trksegway->longitude = atof(cont);
                                //  printf("\n\nlong: %f\n", trksegway->longitude);
                             }
                             xmlNode *node3;
                             
                             for(node3 = node2->children; node3 != NULL; node3=node3->next){
                                 char* name1 = (char*)(node3->name);
                                    if(strcmp(name1,"name")==0){
                                        free(trksegway->name);
                                        trksegway->name = malloc(strlen((char*)node3->children->name)+1000);
                                        strcpy(trksegway->name, (char*)node3->children->content);
                                    
                                       // printf("trksegwayname: %s \n", trksegway->name);
                                    }else if (strcmp(name1,"text")!=0){
                                        char *desc = (char*)node3->children->content;
                                        GPXData * data = malloc(sizeof(GPXData)+ strlen(desc)+10);
                                        strcpy(data->name,nameAttr);
                                        strcpy(data->value,desc);
                                        insertFront(trksegway->otherData,data);
                                    }
                                }
                          }
                         insertFront(trkseg->waypoints,trksegway);
                        }
                    }
                    insertFront(trk->segments,trkseg);
                }
                else if ((strcmp((char*)node1->name,"text")!=0)){
                        char *desc = (char*)node1->children->content;
                        GPXData * data = malloc(sizeof(GPXData)+ strlen(desc)+10);
                        strcpy(data->name,nameAttr);
                        strcpy(data->value,desc);
                        insertFront(trk->otherData,data);
                    }
            }
            insertFront(gpxdoc->tracks,trk);
        }
    }
    xmlFreeDoc(doc);
    xmlCleanupParser();
    return gpxdoc;
}
 

